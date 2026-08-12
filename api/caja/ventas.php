<?php
require_once __DIR__ . '/../config/db.php';

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit();
}

try {
    // Buscar el turno abierto
    $stmtTurno = $pdo->query("SELECT id FROM turnos WHERE estado = 'abierta' ORDER BY hora_apertura DESC LIMIT 1");
    $turno = $stmtTurno->fetch();
    $turnoId = $turno ? $turno['id'] : null;

    $stmt = $pdo->prepare("
        INSERT INTO ventas (id, fecha_hora, cajero, total, metodo_pago, detalles_json, turno_id)
        VALUES (:id, :fecha, :cajero, :total, :metodo_pago, :detalles_json, :turno_id)
    ");
    
    $detalles = json_encode([
        'items' => [], 
        'comision' => $input['comision'] ?? 0, 
        'descripcion' => $input['descripcion'] ?? ''
    ]);

    $stmt->execute([
        ':id' => $input['id'] ?? 'v_' . time(),
        ':fecha' => $input['fecha'] ?? date('Y-m-d H:i:s'),
        ':cajero' => 'Cajero', // Do not overwrite with descripcion
        ':total' => isset($input['monto']) ? (float)$input['monto'] : 0,
        ':metodo_pago' => $input['metodoPago'] ?? 'efectivo',
        ':detalles_json' => $detalles,
        ':turno_id' => $turnoId
    ]);

    echo json_encode([
        'id' => $input['id'] ?? 'v_' . time(),
        'monto' => $input['monto'] ?? 0,
        'metodoPago' => $input['metodoPago'] ?? 'efectivo',
        'comision' => $input['comision'] ?? 0,
        'descripcion' => $input['descripcion'] ?? '',
        'fecha' => $input['fecha'] ?? date('Y-m-d H:i:s'),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
