<?php
// /api/inventario/update.php
require_once __DIR__ . '/../config/db.php';

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'ID is required']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        UPDATE inventario SET
            nombre = :nombre,
            categoria = :categoria,
            stock = :stock,
            precio = :precio,
            stock_minimo = :stock_minimo
        WHERE id = :id
    ");

    $stmt->execute([
        ':id' => $input['id'],
        ':nombre' => $input['name'] ?? 'Producto Actualizado',
        ':categoria' => $input['category'] ?? 'General',
        ':stock' => isset($input['stock']) ? (int)$input['stock'] : 0,
        ':precio' => isset($input['price']) ? (float)$input['price'] : 0,
        ':stock_minimo' => isset($input['minStock']) ? (int)$input['minStock'] : 0
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Producto actualizado correctamente']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
