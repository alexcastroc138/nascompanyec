<?php
// /api/citas/list.php
require_once __DIR__ . '/../config/db.php';

try {
    $stmt = $pdo->query("SELECT * FROM citas ORDER BY created_at DESC");
    $citas = $stmt->fetchAll();
    
    // Convertir nombres de columnas snake_case a camelCase para React
    $mappedCitas = array_map(function($cita) {
        return [
            'id' => $cita['id'],
            'cliente' => $cita['cliente_nombre'],
            'telefono' => $cita['cliente_telefono'],
            'especialista' => $cita['especialista'],
            'servicio' => $cita['servicio'],
            'fecha' => $cita['fecha'],
            'hora' => $cita['hora'],
            'precioTotal' => (float)$cita['monto_total'],
            'abonado' => (float)$cita['abonado'],
            'estadoAbono' => $cita['estado_abono'],
            'metodoPagoAbono' => $cita['metodo_pago_abono'],
            'estado' => $cita['estado'],
            'createdAt' => $cita['created_at']
        ];
    }, $citas);

    echo json_encode(['status' => 'success', 'data' => $mappedCitas]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
