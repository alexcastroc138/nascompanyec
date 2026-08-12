<?php
// /api/usuarios/create.php
require_once __DIR__ . '/../config/db.php';

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input || empty($input['name']) || empty($input['email']) || empty($input['role']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Faltan campos obligatorios']);
    exit();
}

try {
    $id = 'usr_' . time() . rand(100, 999);
    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("
        INSERT INTO usuarios (id, name, email, role, password_hash)
        VALUES (:id, :name, :email, :role, :password_hash)
    ");
    
    $stmt->execute([
        ':id' => $id,
        ':name' => $input['name'],
        ':email' => $input['email'],
        ':role' => $input['role'],
        ':password_hash' => $hashedPassword
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Usuario creado exitosamente',
        'data' => [
            'id' => $id,
            'name' => $input['name'],
            'email' => $input['email'],
            'role' => $input['role']
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
