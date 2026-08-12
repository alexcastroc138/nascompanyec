<?php
// /api/ventas/create.php
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
        INSERT INTO ventas (id, fecha_hora, cajero, total, metodo_pago, detalles_json, turno_id)
        VALUES (:id, NOW(), :cajero, :total, :metodo_pago, :detalles_json, :turno_id)
    ");
    
    // Si viene detalles_json desde el frontend, usarlo. Si no, empaquetar items por defecto.
    $detallesToSave = isset($input['detalles_json']) ? $input['detalles_json'] : (isset($input['items']) ? json_encode($input['items']) : '[]');

    $stmt->execute([
        ':id' => $input['id'] ?? 'venta_' . time(),
        ':cajero' => $input['specialistName'] ?? 'Cajero',
        ':total' => isset($input['subtotal']) ? (float)$input['subtotal'] : 0,
        ':metodo_pago' => $input['paymentMethod'] ?? 'cash',
        ':detalles_json' => $detallesToSave,
        ':turno_id' => $input['turnoId'] ?? null
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Venta registrada correctamente']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
