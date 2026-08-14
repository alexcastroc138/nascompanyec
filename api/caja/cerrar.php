<?php
// /api/caja/cerrar.php - Cierre de Caja y Arqueo Definitivo con vista_arqueo_caja
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Cuerpo de solicitud inválido (JSON requerido).'
    ]);
    exit();
}

try {
    $turnoId = $input['id'] ?? null;
    $usuarioId = $input['usuario_id'] ?? $input['specialistId'] ?? $input['userId'] ?? null;

    // 1. Localizar el registro exacto del turno a cerrar
    $turno = null;

    if (!empty($turnoId)) {
        $stmtFind = $pdo->prepare("SELECT * FROM turnos WHERE id = :id LIMIT 1");
        $stmtFind->execute([':id' => $turnoId]);
        $turno = $stmtFind->fetch(PDO::FETCH_ASSOC);
    }

    if (!$turno && !empty($usuarioId)) {
        $stmtFind = $pdo->prepare("
            SELECT * FROM turnos 
            WHERE usuario_id = :uid 
              AND (estado = 'abierta' OR LOWER(estado) = 'abierta') 
            ORDER BY hora_apertura DESC 
            LIMIT 1
        ");
        $stmtFind->execute([':uid' => $usuarioId]);
        $turno = $stmtFind->fetch(PDO::FETCH_ASSOC);
    }

    if (!$turno) {
        // Fallback: Buscar cualquier turno abierto
        $stmtFind = $pdo->query("
            SELECT * FROM turnos 
            WHERE (estado = 'abierta' OR LOWER(estado) = 'abierta') 
            ORDER BY hora_apertura DESC 
            LIMIT 1
        ");
        $turno = $stmtFind->fetch(PDO::FETCH_ASSOC);
    }

    if (!$turno) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'No se encontró ninguna caja abierta para realizar el cierre.'
        ]);
        exit();
    }

    $idToUpdate = $turno['id'];
    $horaApertura = $turno['hora_apertura'];
    $usuarioNombre = $turno['usuario_nombre'];

    // 2. Extraer o calcular montos
    $efectivoEntregado = isset($input['actualCash']) 
        ? (float)$input['actualCash'] 
        : (isset($input['efectivo_entregado']) 
            ? (float)$input['efectivo_entregado'] 
            : (isset($input['efectivoFisico']) 
                ? (float)$input['efectivoFisico'] 
                : (isset($input['efectivo_real']) ? (float)$input['efectivo_real'] : 0.00)));

    $efectivoEsperado = null;
    if (isset($input['expectedCash'])) {
        $efectivoEsperado = (float)$input['expectedCash'];
    } elseif (isset($input['efectivo_esperado'])) {
        $efectivoEsperado = (float)$input['efectivo_esperado'];
    }

    // Si no se envió efectivo esperado, obtenerlo directamente de vista_arqueo_caja
    if ($efectivoEsperado === null) {
        $stmtArqueo = $pdo->prepare("SELECT esperado_efectivo FROM vista_arqueo_caja WHERE turno_id = :turno_id LIMIT 1");
        $stmtArqueo->execute([':turno_id' => $idToUpdate]);
        $resArqueo = $stmtArqueo->fetch(PDO::FETCH_ASSOC);
        $efectivoEsperado = (float)($resArqueo['esperado_efectivo'] ?? 0.00);
    }

    $diferencia = isset($input['difference']) 
        ? (float)$input['difference'] 
        : (isset($input['diferencia']) ? (float)$input['diferencia'] : ($efectivoEntregado - $efectivoEsperado));

    $observaciones = $input['notes'] ?? $input['observaciones'] ?? $input['novedades'] ?? '';

    // 3. Ejecutar UPDATE asegurando el cambio de estado a 'cerrada'
    $stmtUpdate = $pdo->prepare("
        UPDATE turnos 
        SET estado = 'cerrada',
            hora_cierre = NOW(),
            efectivo_esperado = :efectivo_esperado,
            efectivo_real = :efectivo_real,
            diferencia = :diferencia,
            observaciones = :observaciones
        WHERE id = :id
    ");

    $stmtUpdate->execute([
        ':efectivo_esperado' => round($efectivoEsperado, 2),
        ':efectivo_real' => round($efectivoEntregado, 2),
        ':diferencia' => round($diferencia, 2),
        ':observaciones' => $observaciones,
        ':id' => $idToUpdate
    ]);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Turno de caja cerrado exitosamente.',
        'data' => [
            'id' => $idToUpdate,
            'usuario_id' => $turno['usuario_id'],
            'usuario_nombre' => $turno['usuario_nombre'],
            'estado' => 'cerrada',
            'hora_cierre' => date('Y-m-d H:i:s'),
            'efectivo_esperado' => round($efectivoEsperado, 2),
            'efectivo_real' => round($efectivoEntregado, 2),
            'diferencia' => round($diferencia, 2)
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en base de datos al cerrar caja: ' . $e->getMessage()
    ]);
}
