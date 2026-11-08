import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import prisma from "../database/config";
import { usuario } from "./utilidadesControladores";

export async function listarRecuperacoes(_req: Request, res: Response) {
  try {
    return res.json(
      await prisma.solicitacaoRecuperacaoSenha.findMany({
        where: { status: "PENDENTE" },
        orderBy: { criadaEm: "asc" },
        include: {
          aluno: { select: { nome: true, ra: true } },
          professor: { select: { nome: true, cpf: true } },
        },
      }),
    );
  } catch {
    return res.status(500).json({ error: "Não foi possível listar solicitações" });
  }
}

export async function resolverRecuperacao(req: Request, res: Response) {
  const { aprovar } = req.body ?? {};
  if (typeof aprovar !== "boolean")
    return res.status(400).json({ error: "Informe se aprova ou recusa a solicitação" });
  try {
    const pedido = await prisma.solicitacaoRecuperacaoSenha.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!pedido || pedido.status !== "PENDENTE")
      return res.status(404).json({ error: "Solicitação pendente não encontrada" });
    let temporaryPassword: string | undefined;
    let temporaryPasswordHash: string | undefined;
    const expiration = new Date(Date.now() + 30 * 60 * 1000);
    if (aprovar) {
      temporaryPassword = randomBytes(9).toString("base64url");
      temporaryPasswordHash = await bcrypt.hash(temporaryPassword, 12);
    }
    const ator = usuario(req);
    await prisma.$transaction(async (tx) => {
      if (aprovar && temporaryPasswordHash && pedido.tipoConta === "ALUNO" && pedido.alunoId)
        await tx.aluno.update({
          where: { id: pedido.alunoId },
          data: {
            password: temporaryPasswordHash,
            deveTrocarSenha: true,
            senhaTemporariaExpiraEm: expiration,
          },
        });
      if (
        aprovar &&
        temporaryPasswordHash &&
        pedido.tipoConta === "PROFESSOR" &&
        pedido.professorId
      )
        await tx.professor.update({
          where: { id: pedido.professorId },
          data: {
            password: temporaryPasswordHash,
            deveTrocarSenha: true,
            senhaTemporariaExpiraEm: expiration,
          },
        });
      await tx.solicitacaoRecuperacaoSenha.update({
        where: { id: pedido.id },
        data: { status: aprovar ? "APROVADA" : "RECUSADA", resolvidaEm: new Date() },
      });
      await tx.logAuditoria.create({
        data: {
          atorTipo: ator.tipo,
          atorId: ator.id,
          acao: `RECUPERACAO_${aprovar ? "APROVADA" : "RECUSADA"}`,
          entidade: "SolicitacaoRecuperacaoSenha",
          entidadeId: pedido.id,
          alunoId: pedido.alunoId,
          professorId: pedido.professorId,
          descricao: `Recuperação de ${pedido.tipoConta.toLowerCase()} ${aprovar ? "aprovada" : "recusada"}`,
          dados: { identificador: pedido.identificador },
        },
      });
    });
    return res.json({
      message: aprovar
        ? "Aprovado. Entregue a senha temporária ao usuário por um canal seguro."
        : "Solicitação recusada.",
      ...(temporaryPassword ? { senhaTemporaria: temporaryPassword } : {}),
    });
  } catch {
    return res.status(500).json({ error: "Não foi possível resolver a solicitação" });
  }
}
