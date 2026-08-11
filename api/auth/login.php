<?php
// /api/auth/login.php - Autenticación segura de usuarios para NAS COMPANY EC

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Método no permitido. Debe usar POST."
    ]);
    exit();
}

// Obtener datos del cuerpo JSON de la petición
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Por favor ingresa correo y contraseña."
    ]);
    exit();
}

try {
    // Consulta segura usando Sentencias Preparadas (Prepared Statements)
    $stmt = $pdo->prepare("SELECT id, email, name, password_hash, role FROM usuarios WHERE LOWER(email) = LOWER(:email) LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    // Verificación segura de contraseña con password_verify()
    if ($user && password_verify($password, $user['password_hash'])) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Inicio de sesión exitoso",
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
            "message" => "Credenciales incorrectas. Revisa tu correo y contraseña."
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error interno al procesar el inicio de sesión."
    ]);
}
