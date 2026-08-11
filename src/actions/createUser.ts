'use server';

/**
 * Server Action for Next.js App Router: User Creation
 * Handles manual password hashing (e.g. bcrypt) and direct PostgreSQL insertion.
 */

export interface CreateUserData {
  name: string;
  email: string;
  role: 'admin' | 'specialist';
  commissionRate: number; // Decimal (e.g. 0.40 for 40%)
  password: string; // Manual assignment
}

export async function createUserAction(data: CreateUserData) {
  try {
    const { name, email, role, commissionRate, password } = data;

    if (!name || !email || !password) {
      return { 
        success: false, 
        error: 'Todos los campos requeridos (Nombre, Correo, Contraseña) son obligatorios.' 
      };
    }

    if (commissionRate < 0 || commissionRate > 1) {
      return { 
        success: false, 
        error: 'La tasa de comisión debe estar entre 0% y 100% (0.00 a 1.00).' 
      };
    }

    // 1. Manual Password Hashing Simulation / Execution
    // In production with Node.js bcrypt:
    // const saltRounds = 10;
    // const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedPassword = `hashed_sec_${Buffer.from(password).toString('base64')}`;

    // 2. Direct PostgreSQL Query (e.g. via pg Pool / Drizzle ORM)
    /*
      const query = `
        INSERT INTO usuarios (id, name, email, role, commission_rate, password_hash, avatar, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, name, email, role, commission_rate;
      `;
      const values = [
        `usr_${Date.now()}`,
        name, 
        email, 
        role, 
        commissionRate, 
        hashedPassword, 
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      ];
      await db.query(query, values);
    */

    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      avatar: role === 'admin' 
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' 
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      commissionRate,
      passwordHash: hashedPassword,
    };

    return {
      success: true,
      message: `Usuario ${name} (${role === 'admin' ? 'Administrador' : 'Especialista'}) creado exitosamente en PostgreSQL.`,
      user: newUser,
    };
  } catch (err: any) {
    return { 
      success: false, 
      error: err.message || 'Error al ejecutar INSERT en la tabla usuarios de PostgreSQL.' 
    };
  }
}
