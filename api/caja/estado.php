<?php
require_once __DIR__ . '/../config/db.php';

try {
    $stmt = $pdo->query("SELECT * FROM turnos WHERE estado = 'abierta' ORDER BY hora_apertura DESC LIMIT 1");
    $turno = $stmt->fetch();

    if ($turno) {
        $fechaApertura = date('Y-m-d', strtotime($turno['hora_apertura']));
        $fechaActual = date('Y-m-d');

        if ($fechaApertura < $fechaActual) {
            // Check if observaciones exists
            $hasObservaciones = false;
            try {
                $check = $pdo->query("SHOW COLUMNS FROM turnos LIKE 'observaciones'");
                if($check->rowCount() > 0) $hasObservaciones = true;
            } catch(Exception $e) {}

            if ($hasObservaciones) {
                $updateStmt = $pdo->prepare("UPDATE turnos SET estado = 'cerrada', observaciones = 'Cierre automático de seguridad por cambio de día' WHERE id = :id");
            } else {
                $updateStmt = $pdo->prepare("UPDATE turnos SET estado = 'cerrada' WHERE id = :id");
            }
            $updateStmt->execute([':id' => $turno['id']]);

            echo json_encode([
                'isCajaAbierta' => false,
                'montoInicial' => 0,
                'ventasDelTurno' => []
            ]);
            exit();
        }

        $turnoId = $turno['id'];
        $stmtVentas = $pdo->prepare("SELECT * FROM ventas WHERE turno_id = :turno_id ORDER BY fecha_hora DESC");
        $stmtVentas->execute([':turno_id' => $turnoId]);
        $ventasRaw = $stmtVentas->fetchAll();

        $ventasDelTurno = array_map(function($v) {
            return [
                'id' => $v['id'],
                'monto' => (float)$v['total'],
                'metodoPago' => $v['metodo_pago'],
                'fecha' => $v['fecha_hora'],
                'descripcion' => $v['cajero'],
                'comision' => 0
            ];
        }, $ventasRaw);

        echo json_encode([
            'isCajaAbierta' => true,
            'montoInicial' => 0,
            'ventasDelTurno' => $ventasDelTurno
        ]);
    } else {
        echo json_encode([
            'isCajaAbierta' => false,
            'montoInicial' => 0,
            'ventasDelTurno' => []
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
