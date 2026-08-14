<?php
require_once __DIR__ . '/../config/db.php';

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input || empty($input['nombre'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'El nombre de la categoría es obligatorio']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO categorias (nombre) VALUES (:nombre)");
    $stmt->execute([':nombre' => $input['nombre']]);
    
    // Devolver la categoría creada con su ID
    $id = $pdo->lastInsertId();
    echo json_encode(['status' => 'success', 'message' => 'Categoría agregada', 'data' => ['id' => $id, 'nombre' => $input['nombre']]]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
