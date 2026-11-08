import type { Request, Response } from "express";
import prisma from "../database/config";

export async function logs(_req: Request, res: Response) {
  try {
    return res.json(
      await prisma.logAuditoria.findMany({ orderBy: { criadoEm: "desc" }, take: 200 }),
    );
  } catch {
    return res.status(500).json({ error: "Não foi possível carregar os registros" });
  }
}
