<?php
// /api/setup/seed.php - Script de Inicialización de Cuentas para Hostinger

require_once __DIR__ . '/../config/db.php';

try {
    // 1. Crear tabla de usuarios si no existe
    $createTableSQL = "
    CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(120) NOT NULL UNIQUE,
        name VARCHAR(120) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'cajero',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($createTableSQL);

    // 2. Definir cuentas de producción requeridas
    $seedUsers = [
        [
            'id' => 'usr_admin_nas',
            'email' => 'adminnas@nascompanyec.com',
            'name' => 'Administrador NAS',
            'plain_password' => 'NasCompanyadmin@415263',
            'role' => 'admin'
        ],
        [
            'id' => 'usr_ambar_nas',
            'email' => 'ambar@nascompanyec.com',
            'name' => 'Ámbar Piercing',
            'plain_password' => 'AmbarNascompanyec@415263',
            'role' => 'cajero'
        ]
    ];

    $logs = [];

    // 3. Insertar o actualizar cuentas encriptando las contraseñas
    foreach ($seedUsers as $u) {
        $hash = password_hash($u['plain_password'], PASSWORD_BCRYPT);

        // Verificar si el usuario ya existe
        $checkStmt = $pdo->prepare("SELECT id FROM usuarios WHERE LOWER(email) = LOWER(:email)");
        $checkStmt->execute([':email' => $u['email']]);
        $existing = $checkStmt->fetch();

        if ($existing) {
            $updateStmt = $pdo->prepare("
                UPDATE usuarios 
                SET name = :name, password_hash = :hash, role = :role 
                WHERE LOWER(email) = LOWER(:email)
            ");
            $updateStmt->execute([
                ':name' => $u['name'],
                ':hash' => $hash,
                ':role' => $u['role'],
                ':email' => $u['email']
            ]);
            $logs[] = "Usuario '{$u['email']}' actualizado con nueva clave encriptada.";
        } else {
            $insertStmt = $pdo->prepare("
                INSERT INTO usuarios (id, email, name, password_hash, role) 
                VALUES (:id, :email, :name, :hash, :role)
            ");
            $insertStmt->execute([
                ':id' => $u['id'],
                ':email' => $u['email'],
                ':name' => $u['name'],
                ':hash' => $hash,
                ':role' => $u['role']
            ]);
            $logs[] = "Usuario '{$u['email']}' insertado exitosamente.";
        }
    }

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Cuentas iniciales configuradas correctamente en MySQL.",
        "logs" => $logs
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al ejecutar el seed script: " . $e->getMessage()
    ]);
}
