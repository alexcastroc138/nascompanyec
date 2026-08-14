<?php
require_once __DIR__ . '/../config/db.php';

try {
    // Create table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Check if empty, maybe insert defaults
    $stmt = $pdo->query("SELECT COUNT(*) FROM categorias");
    $count = $stmt->fetchColumn();
    if ($count == 0) {
        $defaults = ['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa'];
        $insertStmt = $pdo->prepare("INSERT IGNORE INTO categorias (nombre) VALUES (:nombre)");
        foreach ($defaults as $cat) {
            $insertStmt->execute([':nombre' => $cat]);
        }
    }

    $stmt = $pdo->query("SELECT id, nombre FROM categorias ORDER BY nombre ASC");
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Optionally insert categories from inventario if they don't exist
    try {
        $stmt2 = $pdo->query("SELECT DISTINCT category as nombre FROM inventario WHERE category IS NOT NULL AND category != ''");
        $inventarioCats = $stmt2->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($inventarioCats as $catName) {
            $insertStmt = $pdo->prepare("INSERT IGNORE INTO categorias (nombre) VALUES (:nombre)");
            $insertStmt->execute([':nombre' => $catName]);
        }
        
        // Re-fetch to get complete list with IDs
        $stmt = $pdo->query("SELECT id, nombre FROM categorias ORDER BY nombre ASC");
        $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Table inventario might not exist or error, just ignore
    }
    
    echo json_encode(['status' => 'success', 'data' => $categorias]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
