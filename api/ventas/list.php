<?php
// /api/ventas/list.php
require_once __DIR__ . '/../config/db.php';

try {
    $stmt = $pdo->query("SELECT * FROM ventas ORDER BY fecha_hora DESC");
    $ventas = $stmt->fetchAll();
    
    $mappedVentas = array_map(function($venta) {
        $decoded = json_decode($venta['detalles_json'], true);
        $items = [];
        if (is_array($decoded)) {
            if (isset($decoded['items'])) {
                $items = $decoded['items'];
            } else if (isset($decoded[0])) { 
                $items = $decoded; 
            }
        }
        
        return [
            'id' => $venta['id'],
            'timestamp' => $venta['fecha_hora'],
            'specialistName' => $venta['cajero'],
            'subtotal' => (float)$venta['total'],
            'paymentMethod' => $venta['metodo_pago'],
            'items' => is_array($items) ? $items : [],
            'detalles_json' => $venta['detalles_json'],
            'createdAt' => $venta['created_at']
        ];
    }, $ventas);

    echo json_encode(['status' => 'success', 'data' => $mappedVentas]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
