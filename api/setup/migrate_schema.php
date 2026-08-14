<?php
// /api/setup/migrate_schema.php - Script de Creación de Tablas y Vista de Arqueo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';

try {
    // 1. Crear tabla citas
    $createCitasSQL = "
    CREATE TABLE IF NOT EXISTS citas (
        id VARCHAR(50) PRIMARY KEY,
        cliente_nombre VARCHAR(150) NOT NULL,
        cliente_telefono VARCHAR(50),
        especialista VARCHAR(100),
        servicio VARCHAR(150),
        fecha DATE,
        hora VARCHAR(20),
        monto_total DECIMAL(10,2),
        abonado DECIMAL(10,2),
        saldo_pendiente DECIMAL(10,2),
        estado_abono VARCHAR(50),
        metodo_pago_abono VARCHAR(50),
        estado VARCHAR(50) DEFAULT 'pendiente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($createCitasSQL);

    // 2. Crear tabla ventas
    $createVentasSQL = "
    CREATE TABLE IF NOT EXISTS ventas (
        id VARCHAR(50) PRIMARY KEY,
        fecha_hora DATETIME,
        cajero VARCHAR(100),
        total DECIMAL(10,2),
        metodo_pago VARCHAR(50),
        detalles_json TEXT,
        turno_id VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($createVentasSQL);
    
    try {
        $pdo->exec("ALTER TABLE ventas ADD COLUMN turno_id VARCHAR(50) NULL AFTER detalles_json");
    } catch (PDOException $ex) {
        // Ignorar si la columna ya existe
    }

    // 3. Crear tabla inventario
    $createInventarioSQL = "
    CREATE TABLE IF NOT EXISTS inventario (
        id VARCHAR(50) PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        categoria VARCHAR(100),
        stock INT DEFAULT 0,
        precio DECIMAL(10,2),
        stock_minimo INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($createInventarioSQL);

    // 4. Crear tabla turnos (caja individual por usuario)
    $createTurnosSQL = "
    CREATE TABLE IF NOT EXISTS turnos (
        id VARCHAR(50) PRIMARY KEY,
        usuario_id VARCHAR(50) NOT NULL,
        usuario_nombre VARCHAR(100) NOT NULL,
        hora_apertura DATETIME NOT NULL,
        hora_cierre DATETIME NULL,
        estado VARCHAR(20) DEFAULT 'abierta',
        efectivo_esperado DECIMAL(10,2) DEFAULT 0,
        efectivo_real DECIMAL(10,2) DEFAULT 0,
        diferencia DECIMAL(10,2) DEFAULT 0,
        observaciones TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($createTurnosSQL);

    // 5. Crear o actualizar la vista SQL de Arqueo de Caja (vista_arqueo_caja)
    $createVistaSQL = "
    CREATE OR REPLACE VIEW vista_arqueo_caja AS
    SELECT 
        v.turno_id,
        COUNT(v.id) AS total_transacciones,
        COALESCE(SUM(v.total), 0) AS total_ventas,
        COALESCE(SUM(
            CASE 
                WHEN LOWER(TRIM(v.metodo_pago)) IN ('efectivo', 'cash') THEN v.total
                WHEN LOWER(TRIM(v.metodo_pago)) = 'mixto' AND JSON_VALID(v.detalles_json) THEN 
                    COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(v.detalles_json, '$.pagos.efectivo')) AS DECIMAL(10,2)), 0)
                ELSE 0 
            END
        ), 0) AS esperado_efectivo,
        COALESCE(SUM(
            CASE 
                WHEN LOWER(TRIM(v.metodo_pago)) IN ('transfer', 'transferencia') THEN v.total
                WHEN LOWER(TRIM(v.metodo_pago)) = 'mixto' AND JSON_VALID(v.detalles_json) THEN 
                    COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(v.detalles_json, '$.pagos.transferencia')) AS DECIMAL(10,2)), 0)
                ELSE 0 
            END
        ), 0) AS esperado_transferencia,
        COALESCE(SUM(
            CASE 
                WHEN LOWER(TRIM(v.metodo_pago)) IN ('de_una', 'deuna') THEN v.total
                WHEN LOWER(TRIM(v.metodo_pago)) = 'mixto' AND JSON_VALID(v.detalles_json) THEN 
                    COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(v.detalles_json, '$.pagos.de_una')) AS DECIMAL(10,2)), 0)
                ELSE 0 
            END
        ), 0) AS esperado_de_una,
        COALESCE(SUM(
            CASE 
                WHEN LOWER(TRIM(v.metodo_pago)) IN ('tarjeta', 'card') THEN v.total
                WHEN LOWER(TRIM(v.metodo_pago)) = 'mixto' AND JSON_VALID(v.detalles_json) THEN 
                    COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(v.detalles_json, '$.pagos.tarjeta')) AS DECIMAL(10,2)), 0)
                ELSE 0 
            END
        ), 0) AS esperado_tarjeta
    FROM ventas v
    WHERE v.turno_id IS NOT NULL AND v.turno_id != ''
    GROUP BY v.turno_id;
    ";
    $pdo->exec($createVistaSQL);

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Esquema y vista vista_arqueo_caja migrados correctamente."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al ejecutar la migración del esquema: " . $e->getMessage()
    ]);
}
