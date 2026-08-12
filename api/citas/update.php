<?php
// /api/citas/update.php
require_once __DIR__ . '/../config/db.php';

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'ID is required']);
    exit();
}

try {
    $monto_total = isset($input['precioTotal']) ? (float)$input['precioTotal'] : (isset($input['price']) ? (float)$input['price'] : 0);
    $abonado = isset($input['abonado']) ? (float)$input['abonado'] : (isset($input['deposit']) ? (float)$input['deposit'] : 0);
    $saldo = max(0, $monto_total - $abonado);

    $stmt = $pdo->prepare("
        UPDATE citas SET 
            cliente_nombre = :cliente_nombre,
            cliente_telefono = :cliente_telefono,
            especialista = :especialista,
            servicio = :servicio,
            fecha = :fecha,
            hora = :hora,
            monto_total = :monto_total,
            abonado = :abonado,
            saldo_pendiente = :saldo_pendiente,
            estado_abono = :estado_abono,
            metodo_pago_abono = :metodo_pago_abono,
            estado = :estado
        WHERE id = :id
    ");

    $stmt->execute([
        ':id' => $input['id'],
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

    echo json_encode(['status' => 'success', 'message' => 'Cita actualizada correctamente']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
