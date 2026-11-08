import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../database/config";
import { isValidCpf, isValidPassword, normalizeCpf } from "../domainRules";

async function main() {
  const nome = process.env.INITIAL_ADMIN_NOME?.trim();
  const cpf = process.env.INITIAL_ADMIN_CPF
    ? normalizeCpf(process.env.INITIAL_ADMIN_CPF)
    : undefined;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const cargo = process.env.INITIAL_ADMIN_CARGO === "COORDENADOR" ? "COORDENADOR" : "DIRETOR";
  if (!nome || !cpf || !isValidCpf(cpf) || !password || !isValidPassword(password)) {
    throw new Error(
      "Defina INITIAL_ADMIN_NOME, INITIAL_ADMIN_CPF (CPF válido) e INITIAL_ADMIN_PASSWORD (maiúscula, minúscula, número, símbolo e mínimo de 8 caracteres) no .env",
    );
  }
  const existente = await prisma.administrador.findUnique({ where: { cpf } });
  if (existente)
    throw new Error("Já existe uma conta administrativa com este CPF; nenhum dado foi alterado.");
  const dataNascimento = process.env.INITIAL_ADMIN_DATA_NASCIMENTO || "1981-01-01";
  const idade = Number(process.env.INITIAL_ADMIN_IDADE || 45);
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction(async (tx) => {
    const admin = await tx.administrador.create({
      data: {
        nome,
        cpf,
        idade,
        dataNascimento: new Date(dataNascimento),
        password: passwordHash,
        cargo,
      },
    });
    await tx.logAuditoria.create({
      data: {
        atorTipo: "SISTEMA",
        atorId: admin.id,
        acao: "ADMINISTRADOR_CRIADO",
        entidade: "Administrador",
        entidadeId: String(admin.id),
        descricao: `Administrador ${admin.nome} criado como ${cargo}`,
      },
    });
  });
  console.log(`Administrador ${nome} criado (${cargo}).`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
