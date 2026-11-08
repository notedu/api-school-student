import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../database/config";
import { getJwtSecret, type TipoAutenticado } from "../middleware/auth";
import { isValidPassword } from "../domainRules";
import { registrar, usuario } from "./utilidadesControladores";

export async function login(req: Request, res: Response) {
  const { identificador, password, tipoConta } = req.body ?? {};
  if (typeof identificador !== "string" || typeof password !== "string")
    return res.status(400).json({ error: "Informe seu RA ou CPF e a senha" });
  try {
    let conta: {
      id: number;
      nome: string;
      password: string;
      deveTrocarSenha?: boolean;
      senhaTemporariaExpiraEm?: Date | null;
      cargo?: string;
    } | null = null;
    let tipo: TipoAutenticado;
    if (tipoConta === "ALUNO") {
      conta = await prisma.aluno.findUnique({ where: { ra: identificador.trim() } });
      tipo = "ALUNO";
    } else if (tipoConta === "PROFESSOR") {
      conta = await prisma.professor.findUnique({
        where: { cpf: identificador.replace(/\D/g, "") },
      });
      tipo = "PROFESSOR";
    } else if (tipoConta === "ADMIN") {
      conta = await prisma.administrador.findUnique({
        where: { cpf: identificador.replace(/\D/g, "") },
      });
      tipo = "ADMIN";
    } else {
      conta = await prisma.aluno.findUnique({ where: { ra: identificador.trim() } });
      tipo = "ALUNO";
      if (!conta) {
        conta = await prisma.professor.findUnique({
          where: { cpf: identificador.replace(/\D/g, "") },
        });
        tipo = "PROFESSOR";
      }
      if (!conta) {
        conta = await prisma.administrador.findUnique({
          where: { cpf: identificador.replace(/\D/g, "") },
        });
        tipo = "ADMIN";
      }
    }
    if (!conta || !(await bcrypt.compare(password, conta.password)))
      return res.status(401).json({ error: "Identificação ou senha inválida" });
    if (
      conta.deveTrocarSenha &&
      (!conta.senhaTemporariaExpiraEm || conta.senhaTemporariaExpiraEm < new Date())
    )
      return res
        .status(401)
        .json({ error: "Senha temporária expirada. Solicite uma nova recuperação" });
    const token = jwt.sign({ role: tipo }, getJwtSecret(), {
      subject: String(conta.id),
      expiresIn: "8h",
    });
    return res.json({
      token,
      usuario: {
        id: conta.id,
        nome: conta.nome,
        tipo,
        deveTrocarSenha: conta.deveTrocarSenha ?? false,
        ...(tipo === "ADMIN" ? { cargo: conta.cargo } : {}),
      },
    });
  } catch {
    return res.status(500).json({ error: "Não foi possível realizar o login" });
  }
}

export async function trocarSenha(req: Request, res: Response) {
  const { senhaAtual, novaSenha } = req.body ?? {};
  const contaReq = usuario(req);
  if (typeof novaSenha !== "string" || !isValidPassword(novaSenha))
    return res
      .status(400)
      .json({ error: "Use pelo menos 8 caracteres, com maiúscula, minúscula, número e símbolo" });
  try {
    const conta =
      contaReq.tipo === "ALUNO"
        ? await prisma.aluno.findUnique({ where: { id: contaReq.id } })
        : contaReq.tipo === "PROFESSOR"
          ? await prisma.professor.findUnique({ where: { id: contaReq.id } })
          : await prisma.administrador.findUnique({ where: { id: contaReq.id } });
    if (
      !conta ||
      typeof senhaAtual !== "string" ||
      !(await bcrypt.compare(senhaAtual, conta.password))
    )
      return res.status(401).json({ error: "Senha atual inválida" });
    const hash = await bcrypt.hash(novaSenha, 12);
    if (contaReq.tipo === "ALUNO")
      await prisma.aluno.update({
        where: { id: contaReq.id },
        data: { password: hash, deveTrocarSenha: false, senhaTemporariaExpiraEm: null },
      });
    else if (contaReq.tipo === "PROFESSOR")
      await prisma.professor.update({
        where: { id: contaReq.id },
        data: { password: hash, deveTrocarSenha: false, senhaTemporariaExpiraEm: null },
      });
    else
      await prisma.administrador.update({ where: { id: contaReq.id }, data: { password: hash } });
    await registrar(
      req,
      "SENHA_ALTERADA",
      contaReq.tipo,
      String(contaReq.id),
      "Senha da conta atualizada",
    );
    return res.json({ message: "Senha atualizada" });
  } catch {
    return res.status(500).json({ error: "Não foi possível atualizar a senha" });
  }
}

export async function pedirRecuperacao(req: Request, res: Response) {
  const { tipoConta, identificador } = req.body ?? {};
  if (!(tipoConta === "ALUNO" || tipoConta === "PROFESSOR") || typeof identificador !== "string")
    return res.status(400).json({ error: "Informe o tipo de conta e RA ou CPF" });
  try {
    const key = identificador.replace(/\D/g, "");
    const aluno =
      tipoConta === "ALUNO"
        ? await prisma.aluno.findUnique({
            where: { ra: identificador.trim() },
            select: { id: true },
          })
        : null;
    const professor =
      tipoConta === "PROFESSOR"
        ? await prisma.professor.findUnique({ where: { cpf: key }, select: { id: true } })
        : null;
    const id = aluno?.id ?? professor?.id;
    if (!id)
      return res.json({
        message: "Se os dados estiverem corretos, a solicitação será encaminhada ao administrador.",
      });
    const recente = await prisma.solicitacaoRecuperacaoSenha.findFirst({
      where: {
        status: "PENDENTE",
        ...(tipoConta === "ALUNO" ? { alunoId: id } : { professorId: id }),
      },
    });
    if (!recente) {
      await prisma.$transaction(async (tx) => {
        const created = await tx.solicitacaoRecuperacaoSenha.create({
          data: {
            tipoConta,
            identificador: tipoConta === "ALUNO" ? identificador.trim() : key,
            alunoId: aluno?.id,
            professorId: professor?.id,
          },
        });
        await tx.logAuditoria.create({
          data: {
            atorTipo: "SISTEMA",
            atorId: id,
            acao: "RECUPERACAO_SOLICITADA",
            entidade: "SolicitacaoRecuperacaoSenha",
            entidadeId: created.id,
            alunoId: aluno?.id,
            professorId: professor?.id,
            descricao: `Solicitação de recuperação de senha para ${tipoConta.toLowerCase()}`,
            dados: { tipoConta, identificador: created.identificador },
          },
        });
      });
    }
    return res.json({
      message: "Se os dados estiverem corretos, a solicitação será encaminhada ao administrador.",
    });
  } catch {
    return res.status(500).json({ error: "Não foi possível enviar a solicitação" });
  }
}
