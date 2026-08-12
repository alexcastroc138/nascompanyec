<?php
// /api/config/db.php - Conexión MySQL PDO para Hostinger

// Cabeceras CORS y Content-Type JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de peticiones preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configurar Zona Horaria Ecuador
date_default_timezone_set('America/Guayaquil');

// Variables de conexión leyendo de entorno o constantes
$db_host = getenv('DB_HOST') ?: (defined('DB_HOST') ? DB_HOST : 'localhost');
$db_name = getenv('DB_NAME') ?: (defined('DB_NAME') ? DB_NAME : 'nas_company_db');
$db_user = getenv('DB_USER') ?: (defined('DB_USER') ? DB_USER : 'nas_user');
$db_pass = getenv('DB_PASS') ?: (defined('DB_PASS') ? DB_PASS : '');

try {
    $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false, // Desactiva emulación para prevenir Inyección SQL
    ];
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
    
    // Forzar zona horaria en la sesión de MySQL
    $pdo->exec("SET time_zone = '-05:00';");

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error de conexión a la base de datos MySQL: " . $e->getMessage()
    ]);
    exit();
}
