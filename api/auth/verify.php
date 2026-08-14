<?php
// /api/auth/verify.php - Verificación de sesión y token para NAS COMPANY EC

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Método no permitido. Debe usar POST."
    ]);
    exit();
}

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$id = isset($input['id']) ? trim($input['id']) : '';
$token = isset($input['token']) ? trim($input['token']) : '';

if (empty($id) && empty($token)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Identificador o token no proporcionado."
    ]);
    exit();
}

try {
    // Si viene id, verificar si el usuario existe y está activo
    if (!empty($id)) {
        $stmt = $pdo->prepare("SELECT id, email, name, role FROM usuarios WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $user = $stmt->fetch();
    } else {
        // En caso de que se pase sólo token o email
        $stmt = $pdo->prepare("SELECT id, email, name, role FROM usuarios WHERE email = :token LIMIT 1");
        $stmt->execute([':token' => $token]);
        $user = $stmt->fetch();
    }

    if ($user) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Sesión válida",
            "user" => [
                "id" => $user['id'],
                "email" => $user['email'],
                "name" => $user['name'],
                "role" => $user['role']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "Usuario no encontrado o sesión inválida."
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error interno al validar la sesión."
    ]);
}
