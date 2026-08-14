<?php
// /api/ventas/create.php - Registro Estricto de Venta y Vinculación Obligatoria a Turno de Caja
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
        'message' => 'Cuerpo JSON inválido o vacío'
    ]);
    exit();
}

try {
    // 1. REGLA ESTRICTA: Validar que el turno_id venga presente y no vacío
    $turnoId = $input['turno_id'] ?? $input['turnoId'] ?? null;

    if (empty($turnoId) || trim((string)$turnoId) === '') {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'No se puede registrar la venta sin una caja abierta'
        ]);
        exit();
    }

    $cajero = $input['specialistName'] ?? $input['cajero'] ?? 'Cajero';

    $detallesToSave = isset($input['detalles_json']) 
        ? (is_string($input['detalles_json']) ? $input['detalles_json'] : json_encode($input['detalles_json']))
        : (isset($input['items']) ? json_encode($input['items']) : '[]');

    $totalVenta = isset($input['subtotal']) 
        ? (float)$input['subtotal'] 
        : (isset($input['total']) 
            ? (float)$input['total'] 
            : (isset($input['monto']) ? (float)$input['monto'] : 0.0));

    $metodoPago = $input['paymentMethod'] ?? $input['metodo_pago'] ?? $input['metodoPago'] ?? 'cash';
    $idVenta = $input['id'] ?? ('venta_' . time() . '_' . rand(100, 999));
    $fechaVenta = $input['timestamp'] ?? $input['fecha'] ?? date('Y-m-d H:i:s');

    // 2. Insertar en la tabla ventas con el turno_id obligatorio
    $stmt = $pdo->prepare("
        INSERT INTO ventas (id, fecha_hora, cajero, total, metodo_pago, detalles_json, turno_id)
        VALUES (:id, :fecha_hora, :cajero, :total, :metodo_pago, :detalles_json, :turno_id)
    ");
    
    $stmt->execute([
        ':id' => $idVenta,
        ':fecha_hora' => $fechaVenta,
        ':cajero' => $cajero,
        ':total' => $totalVenta,
        ':metodo_pago' => $metodoPago,
        ':detalles_json' => $detallesToSave,
        ':turno_id' => $turnoId
    ]);

    http_response_code(200);
    echo json_encode([
        'status' => 'success', 
        'message' => 'Venta registrada correctamente',
        'id' => $idVenta,
        'turno_id' => $turnoId
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al registrar venta en base de datos: ' . $e->getMessage()
    ]);
}
