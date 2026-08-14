<?php
// /api/caja/ventas.php - Registro de Venta desde el Módulo de Caja
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
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit();
}

try {
    $turnoId = $input['turno_id'] ?? $input['turnoId'] ?? null;

    if (empty($turnoId)) {
        // Buscar el turno abierto si no vino explícito
        $stmtTurno = $pdo->query("SELECT id FROM turnos WHERE estado = 'abierta' ORDER BY hora_apertura DESC LIMIT 1");
        $turno = $stmtTurno->fetch(PDO::FETCH_ASSOC);
        $turnoId = $turno ? $turno['id'] : null;
    }

    if (empty($turnoId)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'No se puede registrar la venta sin una caja abierta'
        ]);
        exit();
    }

    $idVenta = $input['id'] ?? ('v_' . time());
    $fechaVenta = $input['fecha'] ?? date('Y-m-d H:i:s');
    $monto = isset($input['monto']) ? (float)$input['monto'] : (isset($input['total']) ? (float)$input['total'] : 0.0);
    $metodoPago = $input['metodoPago'] ?? $input['metodo_pago'] ?? 'efectivo';
    $cajero = $input['cajero'] ?? $input['specialistName'] ?? 'Cajero';

    $detalles = isset($input['detalles_json']) 
        ? (is_string($input['detalles_json']) ? $input['detalles_json'] : json_encode($input['detalles_json']))
        : json_encode([
            'items' => $input['items'] ?? [], 
            'comision' => $input['comision'] ?? 0, 
            'descripcion' => $input['descripcion'] ?? ''
        ]);

    $stmt = $pdo->prepare("
        INSERT INTO ventas (id, fecha_hora, cajero, total, metodo_pago, detalles_json, turno_id)
        VALUES (:id, :fecha, :cajero, :total, :metodo_pago, :detalles_json, :turno_id)
    ");

    $stmt->execute([
        ':id' => $idVenta,
        ':fecha' => $fechaVenta,
        ':cajero' => $cajero,
        ':total' => $monto,
        ':metodo_pago' => $metodoPago,
        ':detalles_json' => $detalles,
        ':turno_id' => $turnoId
    ]);

    http_response_code(200);
    echo json_encode([
        'id' => $idVenta,
        'monto' => $monto,
        'metodoPago' => $metodoPago,
        'comision' => $input['comision'] ?? 0,
        'descripcion' => $input['descripcion'] ?? '',
        'fecha' => $fechaVenta,
        'turno_id' => $turnoId
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
