import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Da de alta (o promueve a) el primer usuario ADMIN. Necesario porque
 * updateCustomerRoleAction requiere sesión de admin ya activa -- este
 * script rompe ese huevo-y-gallina inicial, hablando directo con la BD
 * (mismo patrón que prisma/seed.ts).
 *
 * Uso:
 *   ADMIN_EMAIL=admin@tumarca.com ADMIN_PASSWORD=xxxxxxxx ADMIN_NAME="Nombre Apellido" \
 *     npx tsx prisma/create-admin.ts
 *
 * - Si el email ya existe: se promueve ese usuario a ADMIN (no se toca
 *   su contraseña, para no invalidar una cuenta que ya usa).
 * - Si no existe: se crea un usuario nuevo con rol ADMIN.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME?.trim() || 'Administrador';

  if (!email || !password) {
    console.error('Faltan variables de entorno. Uso:');
    console.error(
      '  ADMIN_EMAIL=admin@tumarca.com ADMIN_PASSWORD=xxxxxxxx ADMIN_NAME="Nombre" npx tsx prisma/create-admin.ts'
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('ADMIN_PASSWORD debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role === 'ADMIN') {
      console.log(`El usuario ${email} ya es ADMIN. Nada que hacer.`);
      return;
    }
    await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } });
    console.log(`Usuario existente ${email} promovido a ADMIN.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const created = await prisma.user.create({
    data: { fullName, email, password: hashedPassword, role: 'ADMIN' },
  });
  console.log(`Usuario ADMIN creado: ${created.email} (id ${created.id}).`);
}

main()
  .catch((error) => {
    console.error('Error dando de alta el admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });