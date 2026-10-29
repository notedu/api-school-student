import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../database/config";

async function main() {
  const nome = process.env.INITIAL_ADMIN_NOME?.trim();
  const usuario = process.env.INITIAL_ADMIN_USUARIO?.trim();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!nome || !usuario || !password || password.length < 12) {
    throw new Error(
      "Defina INITIAL_ADMIN_NOME, INITIAL_ADMIN_USUARIO e INITIAL_ADMIN_PASSWORD (mínimo 12 caracteres) no .env",
    );
  }

  const existente = await prisma.funcionario.findUnique({ where: { usuario } });
  if (existente) {
    throw new Error("Esse usuário já existe; nenhum cadastro foi alterado.");
  }

  await prisma.funcionario.create({
    data: {
      nome,
      usuario,
      password: await bcrypt.hash(password, 12),
      cargo: "ADMIN",
    },
  });

  console.log(`Administrador inicial ${usuario} criado.`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
