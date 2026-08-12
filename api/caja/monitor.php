<?php
// /api/caja/monitor.php
require_once __DIR__ . '/../config/db.php';

try {
    // 1. Obtener todos los turnos abiertos
    $stmt = $pdo->prepare("SELECT * FROM turnos WHERE estado = 'abierta' ORDER BY hora_apertura DESC");
    $stmt->execute();
    $turnos_abiertos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Para cada turno abierto, calcular sus ingresos actuales sumando ventas y citas
    foreach ($turnos_abiertos as &$turno) {
        $turno_id = $turno['id'];
        
        // Ventas asociadas al turno
        $stmt_ventas = $pdo->prepare("
            SELECT COALESCE(SUM(total), 0) as total_ventas 
            FROM ventas 
            WHERE turno_id = ?
        ");
        $stmt_ventas->execute([$turno_id]);
        $total_ventas = $stmt_ventas->fetchColumn();
        
        // Asumimos que los ingresos netos se componen de lo vendido/abonado en este turno.
        $turno['ingresos_calculados'] = (float) $total_ventas;
    }

    echo json_encode([
        "status" => "success",
        "data" => $turnos_abiertos
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error al obtener monitor de cajas: " . $e->getMessage()
    ]);
}
