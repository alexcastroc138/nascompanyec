<?php
// /api/inventario/list.php
require_once __DIR__ . '/../config/db.php';

try {
    $stmt = $pdo->query("SELECT * FROM inventario ORDER BY nombre ASC");
    $items = $stmt->fetchAll();
    
    $mappedItems = array_map(function($item) {
        return [
            'id' => $item['id'],
            'name' => $item['nombre'],
            'category' => $item['categoria'],
            'stock' => (int)$item['stock'],
            'price' => (float)$item['precio'],
            'minStock' => (int)$item['stock_minimo'],
            'unit' => 'unidades'
        ];
    }, $items);

    echo json_encode(['status' => 'success', 'data' => $mappedItems]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
