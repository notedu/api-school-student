import type { Request, Response } from "express";
import prisma from "../database/config";
import { usuario } from "./utilidadesControladores";

export async function resumo(req: Request, res: Response) {
  const u = usuario(req);
  try {
    if (u.tipo === "ALUNO") {
      const [notas, materias, reavaliacoesPendentes] = await Promise.all([
        prisma.nota.count({ where: { alunoId: u.id } }),
        prisma.materia.count({ where: { notas: { some: { alunoId: u.id } } } }),
        prisma.pedidoReavaliacao.count({ where: { alunoId: u.id, status: "PENDENTE" } }),
      ]);
      return res.json({
        alunos: 1,
        professores: 0,
        materias,
        notas,
        reavaliacoesPendentes,
        tipo: u.tipo,
      });
    }
    if (u.tipo === "PROFESSOR") {
      const [notas, materias, reavaliacoesPendentes, alunos] = await Promise.all([
        prisma.nota.count({ where: { materia: { professores: { some: { professorId: u.id } } } } }),
        prisma.materia.count({ where: { professores: { some: { professorId: u.id } } } }),
        prisma.pedidoReavaliacao.count({ where: { professorId: u.id, status: "PENDENTE" } }),
        prisma.nota.findMany({
          where: { materia: { professores: { some: { professorId: u.id } } } },
          distinct: ["alunoId"],
          select: { alunoId: true },
        }),
      ]);
      return res.json({
        alunos: alunos.length,
        professores: 1,
        materias,
        notas,
        reavaliacoesPendentes,
        tipo: u.tipo,
      });
    }
    const [alunos, professores, materias, notas, pendentes] = await Promise.all([
      prisma.aluno.count(),
      prisma.professor.count(),
      prisma.materia.count({ where: { ativa: true } }),
      prisma.nota.count(),
      prisma.pedidoReavaliacao.count({ where: { status: "PENDENTE" } }),
    ]);
    return res.json({
      alunos,
      professores,
      materias,
      notas,
      reavaliacoesPendentes: pendentes,
      tipo: u.tipo,
    });
  } catch {
    return res.status(500).json({ error: "Não foi possível carregar o resumo" });
  }
}
