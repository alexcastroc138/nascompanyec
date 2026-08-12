<?php
// /api/citas/create.php
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
        INSERT INTO citas (
            id, cliente_nombre, cliente_telefono, especialista, servicio, 
            fecha, hora, monto_total, abonado, saldo_pendiente, 
            estado_abono, metodo_pago_abono, estado
        ) VALUES (
            :id, :cliente_nombre, :cliente_telefono, :especialista, :servicio, 
            :fecha, :hora, :monto_total, :abonado, :saldo_pendiente, 
            :estado_abono, :metodo_pago_abono, :estado
        )
    ");
    
    $monto_total = isset($input['precioTotal']) ? (float)$input['precioTotal'] : (isset($input['price']) ? (float)$input['price'] : 0);
    $abonado = isset($input['abonado']) ? (float)$input['abonado'] : (isset($input['deposit']) ? (float)$input['deposit'] : 0);
    $saldo = max(0, $monto_total - $abonado);

    $stmt->execute([
        ':id' => $input['id'] ?? 'cita_' . time(),
        ':cliente_nombre' => $input['cliente'] ?? ($input['customerName'] ?? 'Cliente'),
        ':cliente_telefono' => $input['telefono'] ?? ($input['customerPhone'] ?? ''),
        ':especialista' => $input['especialista'] ?? ($input['specialistName'] ?? ''),
        ':servicio' => $input['servicio'] ?? ($input['service'] ?? ''),
        ':fecha' => !empty($input['fecha']) ? $input['fecha'] : (!empty($input['date']) ? $input['date'] : null),
        ':hora' => $input['hora'] ?? ($input['time'] ?? ''),
        ':monto_total' => $monto_total,
        ':abonado' => $abonado,
        ':saldo_pendiente' => $saldo,
        ':estado_abono' => $input['estadoAbono'] ?? 'sin_abono',
        ':metodo_pago_abono' => $input['metodoPagoAbono'] ?? ($input['metodoPagoInicial'] ?? ''),
        ':estado' => $input['estado'] ?? 'pendiente'
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Cita guardada correctamente']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
