<?php
// /api/caja/abrir.php - Apertura de Caja y Control de Turnos
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Cuerpo de solicitud inválido (JSON requerido).'
    ]);
    exit();
}

try {
    // 1. Validar estrictamente el ID del usuario logueado
    $usuario_id = $input['usuario_id'] ?? $input['specialistId'] ?? $input['userId'] ?? null;
    $usuario_nombre = $input['usuario_nombre'] ?? $input['specialistName'] ?? $input['userName'] ?? 'Especialista';

    if (empty($usuario_id)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'El identificador de usuario (usuario_id) es obligatorio para abrir la caja.'
        ]);
        exit();
    }

    // 2. Candado Obligatorio: SELECT para verificar si ya existe una caja en estado ABIERTA para este usuario
    $stmtCheck = $pdo->prepare("
        SELECT id, hora_apertura, usuario_nombre 
        FROM turnos 
        WHERE usuario_id = :uid 
          AND (estado = 'abierta' OR LOWER(estado) = 'abierta') 
        LIMIT 1
    ");
    $stmtCheck->execute([':uid' => $usuario_id]);
    $turnoExistente = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if ($turnoExistente) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Ya existe un turno abierto',
            'turno_id' => $turnoExistente['id']
        ]);
        exit();
    }

    // 3. Control y asignación de turno horario (Ecuador GMT-5 ya configurado en db.php)
    $horaActual = (int)date('H');
    $turnoAsignado = "Turno Especial";
    if ($horaActual >= 10 && $horaActual < 16) {
        $turnoAsignado = "Turno Mañana";
    } elseif ($horaActual >= 16 && $horaActual < 22) {
        $turnoAsignado = "Turno Tarde";
    }

    // Limpiar sufijo previo si existiera en el nombre
    $nombreBase = trim(preg_replace('/\(.*?\)/', '', $usuario_nombre));
    $nombreCajeroConTurno = $nombreBase . ' (' . $turnoAsignado . ')';

    $nuevoTurnoId = $input['id'] ?? ('t_' . $usuario_id . '_' . time());

    // 4. Inserción protegida en base de datos
    $stmt = $pdo->prepare("
        INSERT INTO turnos (
            id, 
            usuario_id, 
            usuario_nombre, 
            hora_apertura, 
            estado, 
            efectivo_esperado, 
            efectivo_real, 
            diferencia, 
            observaciones
        ) VALUES (
            :id, 
            :usuario_id, 
            :usuario_nombre, 
            NOW(), 
            'abierta', 
            0.00, 
            0.00, 
            0.00, 
            NULL
        )
    ");
    
    $stmt->execute([
        ':id' => $nuevoTurnoId,
        ':usuario_id' => $usuario_id,
        ':usuario_nombre' => $nombreCajeroConTurno,
    ]);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Turno de caja abierto correctamente.',
        'data' => [
            'id' => $nuevoTurnoId,
            'usuario_id' => $usuario_id,
            'usuario_nombre' => $nombreCajeroConTurno,
            'estado' => 'abierta',
            'hora_apertura' => date('Y-m-d H:i:s')
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error de base de datos al abrir caja: ' . $e->getMessage()
    ]);
}
