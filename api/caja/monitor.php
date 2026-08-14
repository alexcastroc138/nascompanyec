<?php
// /api/caja/monitor.php - Monitoreo Global Compatible con Múltiples Estructuras Frontend
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
    // 1. Obtener turnos abiertos con datos de vista_arqueo_caja si existen
    $stmt = $pdo->query("
        SELECT t.*, 
               COALESCE(v.esperado_efectivo, 0) as esperado_efectivo,
               COALESCE(v.esperado_transferencia, 0) as esperado_transferencia,
               COALESCE(v.esperado_de_una, 0) as esperado_de_una,
               COALESCE(v.esperado_tarjeta, 0) as esperado_tarjeta,
               COALESCE(v.total_general, 0) as ingresos_calculados,
               COALESCE(v.total_general, 0) as total_ventas,
               COALESCE(v.cantidad_ventas, 0) as cantidad_ventas
        FROM turnos t
        LEFT JOIN vista_arqueo_caja v ON t.id = v.turno_id
        WHERE t.estado = 'abierta' OR LOWER(t.estado) = 'abierta' 
        ORDER BY t.hora_apertura DESC
    ");
    $cajasAbiertas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Obtener historial de cierres con datos de vista_arqueo_caja si existen
    $stmtHistorial = $pdo->query("
        SELECT t.*, 
               COALESCE(v.esperado_efectivo, t.efectivo_esperado, 0) as esperado_efectivo,
               COALESCE(v.esperado_transferencia, 0) as esperado_transferencia,
               COALESCE(v.esperado_de_una, 0) as esperado_de_una,
               COALESCE(v.esperado_tarjeta, 0) as esperado_tarjeta,
               COALESCE(v.total_general, 0) as total_ventas,
               COALESCE(v.cantidad_ventas, 0) as cantidad_ventas
        FROM turnos t
        LEFT JOIN vista_arqueo_caja v ON t.id = v.turno_id
        WHERE t.estado = 'cerrada' OR LOWER(t.estado) = 'cerrada' 
        ORDER BY t.hora_cierre DESC 
        LIMIT 50
    ");
    $historialCierres = $stmtHistorial->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'cajasAbiertas' => $cajasAbiertas,
        'cajas' => $cajasAbiertas,
        'turnosAbiertos' => $cajasAbiertas,
        'data' => $cajasAbiertas,
        'historialCierres' => $historialCierres,
        'historial' => $historialCierres,
        'cierres' => $historialCierres
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error de base de datos en monitor de caja: ' . $e->getMessage()
    ]);
}
