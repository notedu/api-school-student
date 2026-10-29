import type { Request, Response } from "express";
import prisma from "../database/config";

export class AlunoController {
  async listar(_req: Request, res: Response) {
    try {
      const alunos = await prisma.aluno.findMany({
        orderBy: { id: "desc" },
        select: { id: true, nome: true, idade: true },
      });
      return res.json(alunos);
    } catch {
      return res.status(500).json({ error: "Erro ao buscar alunos" });
    }
  }

  async criar(req: Request, res: Response) {
    const { nome, idade } = req.body ?? {};
    if (
      typeof nome !== "string" || !nome.trim() ||
      !Number.isSafeInteger(idade) || idade < 1 || idade > 120
    ) {
      return res.status(400).json({
        error: "Informe um nome e uma idade inteira entre 1 e 120",
      });
    }

    try {
      const aluno = await prisma.aluno.create({
        data: { nome: nome.trim(), idade },
        select: { id: true, nome: true, idade: true },
      });
      return res.status(201).json(aluno);
    } catch {
      return res.status(500).json({ error: "Erro ao cadastrar aluno" });
    }
  }
}
