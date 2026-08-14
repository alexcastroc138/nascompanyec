<?php
// /api/caja/estado.php - Consulta de Estado de Turno y Arqueo mediante SQL (vista_arqueo_caja)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';

try {
    $specialistId = $_GET['specialistId'] ?? $_GET['usuario_id'] ?? $_GET['id'] ?? null;
    
    // 1. Localizar la caja abierta para el usuario especificado o la más reciente activa
    if ($specialistId) {
        $stmt = $pdo->prepare("
            SELECT * FROM turnos 
            WHERE (estado = 'abierta' OR LOWER(estado) = 'abierta') 
              AND usuario_id = :uid 
            ORDER BY hora_apertura DESC 
            LIMIT 1
        ");
        $stmt->execute([':uid' => $specialistId]);
    } else {
        $stmt = $pdo->query("
            SELECT * FROM turnos 
            WHERE (estado = 'abierta' OR LOWER(estado) = 'abierta') 
            ORDER BY hora_apertura DESC 
            LIMIT 1
        ");
    }
    
    $turno = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($turno) {
        $fechaApertura = date('Y-m-d', strtotime($turno['hora_apertura']));
        $fechaActual = date('Y-m-d');

        // Candado por cambio de día (Medianoche Ecuador): Cierre automático de seguridad
        if ($fechaApertura < $fechaActual) {
            $updateStmt = $pdo->prepare("
                UPDATE turnos 
                SET estado = 'cerrada',
                    hora_cierre = CONCAT(:fechaApertura, ' 23:59:59'),
                    observaciones = 'Cierre automático de seguridad por cambio de día' 
                WHERE id = :id
            ");
            $updateStmt->execute([
                ':id' => $turno['id'],
                ':fechaApertura' => $fechaApertura
            ]);

            echo json_encode([
                'status' => 'success',
                'isCajaAbierta' => false,
                'montoInicial' => 0,
                'esperado_efectivo' => 0.00,
                'esperado_transferencia' => 0.00,
                'esperado_de_una' => 0.00,
                'esperado_tarjeta' => 0.00,
                'total_ventas' => 0.00,
                'efectivoEsperado' => 0.00,
                'ventasDelTurno' => []
            ]);
            exit();
        }

        $turnoId = $turno['id'];

        // 2. Consulta Directa a la Vista SQL vista_arqueo_caja (Sin bucles PHP)
        $stmtArqueo = $pdo->prepare("
            SELECT * FROM vista_arqueo_caja 
            WHERE turno_id = :turno_id 
            LIMIT 1
        ");
        $stmtArqueo->execute([':turno_id' => $turnoId]);
        $arqueo = $stmtArqueo->fetch(PDO::FETCH_ASSOC);

        // Extraer valores calculados directamente por la vista SQL
        $esperadoEfectivo = (float)($arqueo['esperado_efectivo'] ?? 0.0);
        $esperadoTransferencia = (float)($arqueo['esperado_transferencia'] ?? 0.0);
        $esperadoDeUna = (float)($arqueo['esperado_de_una'] ?? $arqueo['esperado_deuna'] ?? 0.0);
        $esperadoTarjeta = (float)($arqueo['esperado_tarjeta'] ?? 0.0);
        $totalVentas = (float)($arqueo['total_ventas'] ?? ($esperadoEfectivo + $esperadoTransferencia + $esperadoDeUna + $esperadoTarjeta));
        $totalTransacciones = (int)($arqueo['total_transacciones'] ?? 0);

        // 3. Listado de ventas vinculadas a este turno para visualización en UI
        $stmtVentas = $pdo->prepare("
            SELECT 
                id, 
                total AS monto, 
                metodo_pago AS metodoPago, 
                fecha_hora AS fecha, 
                cajero AS descripcion, 
                detalles_json, 
                turno_id
            FROM ventas 
            WHERE turno_id = :turno_id 
            ORDER BY fecha_hora DESC, created_at DESC
        ");
        $stmtVentas->execute([':turno_id' => $turnoId]);
        $ventasDelTurno = $stmtVentas->fetchAll(PDO::FETCH_ASSOC);

        // 4. Respuesta JSON con columnas directas de vista_arqueo_caja
        echo json_encode([
            'status' => 'success',
            'isCajaAbierta' => true,
            'turno' => [
                'id' => $turno['id'],
                'usuario_id' => $turno['usuario_id'],
                'usuario_nombre' => $turno['usuario_nombre'],
                'hora_apertura' => $turno['hora_apertura'],
                'estado' => $turno['estado']
            ],
            'montoInicial' => 0,
            // Columnas directas de la vista SQL vista_arqueo_caja
            'esperado_efectivo' => round($esperadoEfectivo, 2),
            'esperado_transferencia' => round($esperadoTransferencia, 2),
            'esperado_de_una' => round($esperadoDeUna, 2),
            'esperado_tarjeta' => round($esperadoTarjeta, 2),
            'total_ventas' => round($totalVentas, 2),
            'total_transacciones' => $totalTransacciones,
            // Compatibilidad para la UI
            'efectivoEsperado' => round($esperadoEfectivo, 2),
            'subtotales' => [
                'efectivo' => round($esperadoEfectivo, 2),
                'transferencia' => round($esperadoTransferencia, 2),
                'de_una' => round($esperadoDeUna, 2),
                'tarjeta' => round($esperadoTarjeta, 2),
                'total' => round($totalVentas, 2)
            ],
            'ventasDelTurno' => $ventasDelTurno
        ]);
    } else {
        echo json_encode([
            'status' => 'success',
            'isCajaAbierta' => false,
            'montoInicial' => 0,
            'esperado_efectivo' => 0.00,
            'esperado_transferencia' => 0.00,
            'esperado_de_una' => 0.00,
            'esperado_tarjeta' => 0.00,
            'total_ventas' => 0.00,
            'efectivoEsperado' => 0.00,
            'ventasDelTurno' => []
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error de base de datos al obtener estado de caja: ' . $e->getMessage()
    ]);
}
