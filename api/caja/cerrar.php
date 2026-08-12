<?php
// /api/caja/cerrar.php
require_once __DIR__ . '/../config/db.php';
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        UPDATE turnos 
        SET hora_cierre = NOW(),
            estado = 'cerrada',
            efectivo_esperado = :efectivo_esperado,
            efectivo_real = :efectivo_real,
            diferencia = :diferencia,
            observaciones = :observaciones
        WHERE id = :id
    ");

    $stmt->execute([
        ':efectivo_esperado' => isset($input['expectedCash']) ? (float)$input['expectedCash'] : 0,
        ':efectivo_real' => isset($input['actualCash']) ? (float)$input['actualCash'] : 0,
        ':diferencia' => isset($input['difference']) ? (float)$input['difference'] : 0,
        ':observaciones' => $input['notes'] ?? '',
        ':id' => $input['id']
    ]);

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
