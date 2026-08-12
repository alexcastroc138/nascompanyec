with open('api/caja/ventas.php', 'r') as f:
    content = f.read()

import re

# We want to change the INSERT execution:
old_execute = """    $stmt->execute([
        ':id' => $input['id'] ?? 'v_' . time(),
        ':fecha' => $input['fecha'] ?? date('Y-m-d H:i:s'),
        ':cajero' => $input['descripcion'] ?? 'Cajero', // using descripcion as cajero fallback
        ':total' => isset($input['monto']) ? (float)$input['monto'] : 0,
        ':metodo_pago' => $input['metodoPago'] ?? 'efectivo',
        ':detalles_json' => json_encode(['comision' => $input['comision'] ?? 0, 'descripcion' => $input['descripcion'] ?? '']),
        ':turno_id' => $turnoId
    ]);"""

new_execute = """    $detalles = json_encode([
        'items' => [], 
        'comision' => $input['comision'] ?? 0, 
        'descripcion' => $input['descripcion'] ?? ''
    ]);

    $stmt->execute([
        ':id' => $input['id'] ?? 'v_' . time(),
        ':fecha' => $input['fecha'] ?? date('Y-m-d H:i:s'),
        ':cajero' => 'Cajero', // Do not overwrite with descripcion
        ':total' => isset($input['monto']) ? (float)$input['monto'] : 0,
        ':metodo_pago' => $input['metodoPago'] ?? 'efectivo',
        ':detalles_json' => $detalles,
        ':turno_id' => $turnoId
    ]);"""

content = content.replace(old_execute, new_execute)
with open('api/caja/ventas.php', 'w') as f:
    f.write(content)
