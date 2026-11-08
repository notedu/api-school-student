import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database/config";

export type TipoAutenticado = "ALUNO" | "PROFESSOR" | "ADMIN";
declare global {
  namespace Express {
    interface Request {
      usuarioAutenticado?: {
        id: number;
        tipo: TipoAutenticado;
        nome: string;
        deveTrocarSenha: boolean;
      };
    }
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("Defina JWT_SECRET com pelo menos 32 bytes no arquivo .env");
  }
  return secret;
}

export async function autenticar(req: Request, res: Response, next: NextFunction) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Token de autenticação ausente" });
  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (typeof payload === "string" || !payload.sub || !payload.role) {
      return res.status(401).json({ error: "Token inválido" });
    }
    const id = Number(payload.sub);
    const tipo = payload.role as TipoAutenticado;
    if (!Number.isSafeInteger(id) || id < 1 || !["ALUNO", "PROFESSOR", "ADMIN"].includes(tipo)) {
      return res.status(401).json({ error: "Token inválido" });
    }
    const conta =
      tipo === "ALUNO"
        ? await prisma.aluno.findUnique({
            where: { id },
            select: { id: true, nome: true, deveTrocarSenha: true, senhaTemporariaExpiraEm: true },
          })
        : tipo === "PROFESSOR"
          ? await prisma.professor.findUnique({
              where: { id },
              select: {
                id: true,
                nome: true,
                deveTrocarSenha: true,
                senhaTemporariaExpiraEm: true,
              },
            })
          : await prisma.administrador.findUnique({
              where: { id },
              select: { id: true, nome: true },
            });
    if (!conta) return res.status(401).json({ error: "Conta não encontrada" });
    const deveTrocarSenha =
      "deveTrocarSenha" in conta && typeof conta.deveTrocarSenha === "boolean"
        ? conta.deveTrocarSenha
        : false;
    if (
      deveTrocarSenha &&
      "senhaTemporariaExpiraEm" in conta &&
      (!conta.senhaTemporariaExpiraEm || conta.senhaTemporariaExpiraEm < new Date())
    ) {
      return res
        .status(401)
        .json({ error: "Senha temporária expirada. Solicite uma nova recuperação" });
    }
    if (deveTrocarSenha && req.path !== "/auth/senha" && req.path !== "/auth/me") {
      return res.status(403).json({ error: "Atualize sua senha temporária antes de continuar" });
    }
    req.usuarioAutenticado = { ...conta, tipo, deveTrocarSenha };
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError)
      return res.status(401).json({ error: "Token inválido ou expirado" });
    return next(error);
  }
}

export function permitir(...tipos: TipoAutenticado[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuarioAutenticado || !tipos.includes(req.usuarioAutenticado.tipo)) {
      return res.status(403).json({ error: "Você não tem permissão para esta ação" });
    }
    return next();
  };
}
