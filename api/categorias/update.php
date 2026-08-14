<?php
require_once __DIR__ . '/../config/db.php';

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input || empty($input['id']) || empty($input['nombre'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'ID y nombre son obligatorios']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE categorias SET nombre = :nombre WHERE id = :id");
    $stmt->execute([':nombre' => $input['nombre'], ':id' => $input['id']]);
    
    echo json_encode(['status' => 'success', 'message' => 'Categoría actualizada']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
