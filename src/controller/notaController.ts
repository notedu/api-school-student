import type { Request, Response } from "express";
import prisma from "../database/config";

export class NotaController {
  async listarDoAluno(req: Request, res: Response) {
    const alunoId = Number(req.params.alunoId);
    if (!Number.isSafeInteger(alunoId) || alunoId <= 0) {
      return res.status(400).json({ error: "ID de aluno inválido" });
    }

    try {
      const aluno = await prisma.aluno.findUnique({
        where: { id: alunoId },
        select: { id: true },
      });
      if (!aluno) {
        return res.status(404).json({ error: "Aluno não encontrado" });
      }

      const notas = await prisma.nota.findMany({
        where: { alunoId },
        select: {
          id: true,
          valor: true,
          funcionario: { select: { id: true, nome: true, cargo: true } },
        },
      });
      return res.json(notas);
    } catch {
      return res.status(500).json({ error: "Erro ao buscar notas do aluno" });
    }
  }

  async atribuir(req: Request, res: Response) {
    const alunoId = Number(req.params.alunoId);
    const { valor } = req.body ?? {};
    const funcionarioId = req.funcionarioAutenticado?.id;

    if (!Number.isSafeInteger(alunoId) || alunoId <= 0) {
      return res.status(400).json({ error: "ID de aluno inválido" });
    }
    if (!funcionarioId) {
      return res.status(401).json({ error: "Funcionário não autenticado" });
    }
    // O schema atual define Decimal(2, 0): nota inteira entre 0 e 99.
    if (!Number.isInteger(valor) || valor < 0 || valor > 99) {
      return res.status(400).json({ error: "A nota deve ser um número inteiro entre 0 e 99" });
    }

    try {
      const aluno = await prisma.aluno.findUnique({
        where: { id: alunoId },
        select: { id: true },
      });
      if (!aluno) {
        return res.status(404).json({ error: "Aluno não encontrado" });
      }

      const nota = await prisma.nota.create({
        data: { valor, alunoId, funcionarioId },
        select: {
          id: true,
          valor: true,
          alunoId: true,
          funcionario: { select: { id: true, nome: true, cargo: true } },
        },
      });
      return res.status(201).json(nota);
    } catch {
      return res.status(500).json({ error: "Erro ao atribuir nota" });
    }
  }
}
