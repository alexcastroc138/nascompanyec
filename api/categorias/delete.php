<?php
require_once __DIR__ . '/../config/db.php';

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input || empty($input['id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'ID de categoría es obligatorio']);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM categorias WHERE id = :id");
    $stmt->execute([':id' => $input['id']]);
    
    echo json_encode(['status' => 'success', 'message' => 'Categoría eliminada']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
