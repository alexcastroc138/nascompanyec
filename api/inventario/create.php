<?php
// /api/inventario/create.php
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
        INSERT INTO inventario (id, nombre, categoria, stock, precio, stock_minimo)
        VALUES (:id, :nombre, :categoria, :stock, :precio, :stock_minimo)
    ");

    $stmt->execute([
        ':id' => $input['id'] ?? 'item_' . time(),
        ':nombre' => $input['name'] ?? 'Producto Nuevo',
        ':categoria' => $input['category'] ?? 'General',
        ':stock' => isset($input['stock']) ? (int)$input['stock'] : 0,
        ':precio' => isset($input['price']) ? (float)$input['price'] : 0,
        ':stock_minimo' => isset($input['minStock']) ? (int)$input['minStock'] : 0
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Producto agregado correctamente']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
