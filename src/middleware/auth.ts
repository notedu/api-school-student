import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database/config";

type Cargo = "ADMIN" | "PROFESSOR";

declare global {
  namespace Express {
    interface Request {
      funcionarioAutenticado?: { id: number; cargo: Cargo };
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
  const authorization = req.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autenticação ausente" });
  }

  try {
    const payload = jwt.verify(authorization.slice("Bearer ".length), getJwtSecret());
    if (typeof payload === "string" || !payload.sub) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const id = Number(payload.sub);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const funcionario = await prisma.funcionario.findUnique({
      where: { id },
      select: { id: true, cargo: true },
    });
    if (!funcionario) {
      return res.status(401).json({ error: "Funcionário não encontrado" });
    }

    req.funcionarioAutenticado = funcionario;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }
    return next(error);
  }
}

export function exigirAdministrador(req: Request, res: Response, next: NextFunction) {
  if (req.funcionarioAutenticado?.cargo !== "ADMIN") {
    return res.status(403).json({ error: "Acesso permitido somente a administradores" });
  }
  return next();
}

export function exigirProfessorOuAdministrador(req: Request, res: Response, next: NextFunction) {
  const cargo = req.funcionarioAutenticado?.cargo;
  if (cargo !== "PROFESSOR" && cargo !== "ADMIN") {
    return res.status(403).json({ error: "Acesso permitido somente a professores e administradores" });
  }
  return next();
}
