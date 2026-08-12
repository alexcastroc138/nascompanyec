<?php
// /api/caja/abrir.php
require_once __DIR__ . '/../config/db.php';

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit();
}

try {
    // 1. Candado de seguridad: verificar si ya hay un turno abierto
    $stmtCheck = $pdo->query("SELECT id FROM turnos WHERE estado = 'abierta' LIMIT 1");
    if ($stmtCheck->fetch()) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Ya hay una caja abierta actualmente. Debe cerrarse antes de abrir una nueva.']);
        exit();
    }

    // 2. Control de horarios
    $horaActual = (int)date('H');
    $turnoAsignado = "Turno Especial"; // fallback

    if ($horaActual >= 10 && $horaActual < 16) {
        $turnoAsignado = "Turno Mañana";
    } elseif ($horaActual >= 16 && $horaActual < 22) {
        $turnoAsignado = "Turno Tarde";
    }

    // Anexar el turno al nombre del cajero
    $nombreCajeroOriginal = $input['specialistName'] ?? 'Especialista';
    $nombreCajeroConTurno = $nombreCajeroOriginal . ' (' . $turnoAsignado . ')';

    $stmt = $pdo->prepare("
        INSERT INTO turnos (id, usuario_id, usuario_nombre, hora_apertura, estado)
        VALUES (:id, :usuario_id, :usuario_nombre, NOW(), 'abierta')
    ");
    
    $stmt->execute([
        ':id' => $input['id'],
        ':usuario_id' => $input['specialistId'],
        ':usuario_nombre' => $nombreCajeroConTurno,
    ]);

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
