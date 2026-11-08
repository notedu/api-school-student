import type { Request, Response } from "express";
import prisma from "../database/config";
import { isValidGrade } from "../domainRules";
import {
  numeroPositivo,
  periodosBimestrais,
  instrumentosAvaliativos,
  registrar,
  usuario,
} from "./utilidadesControladores";

export async function listarNotas(req: Request, res: Response) {
  const u = usuario(req);
  try {
    const where =
      u.tipo === "ALUNO"
        ? { alunoId: u.id }
        : u.tipo === "PROFESSOR"
          ? { materia: { professores: { some: { professorId: u.id } } } }
          : {};
    return res.json(
      await prisma.nota.findMany({
        where,
        orderBy: { atualizadoEm: "desc" },
        include: {
          aluno: { select: { id: true, nome: true, ra: true } },
          materia: { select: { id: true, nome: true, codigo: true, cor: true } },
          professor: { select: { id: true, nome: true } },
          reavaliacoes: { select: { id: true, status: true, criadoEm: true } },
        },
      }),
    );
  } catch {
    return res.status(500).json({ error: "Não foi possível listar notas" });
  }
}

export async function atribuirNota(req: Request, res: Response) {
  const { alunoId, materiaId, professorId, valor, titulo, periodo } = req.body ?? {};
  const ator = usuario(req);
  if (
    !numeroPositivo(alunoId) ||
    !numeroPositivo(materiaId) ||
    !Number.isInteger(Number(valor)) ||
    !isValidGrade(valor) ||
    typeof titulo !== "string" ||
    !instrumentosAvaliativos.includes(titulo) ||
    typeof periodo !== "string" ||
    !periodosBimestrais.includes(periodo)
  )
    return res
      .status(400)
      .json({
        error:
          "Informe aluno, matéria, instrumento avaliativo, bimestre válido e uma nota inteira entre 0 e 10",
      });
  const idProfessor = ator.tipo === "PROFESSOR" ? ator.id : Number(professorId);
  if (!numeroPositivo(idProfessor))
    return res.status(400).json({ error: "Informe o professor responsável pela nota" });
  try {
    const atribuicao = await prisma.professorMateria.findUnique({
      where: { professorId_materiaId: { professorId: idProfessor, materiaId: Number(materiaId) } },
    });
    if (!atribuicao)
      return res.status(403).json({ error: "O professor não está atribuído a esta matéria" });
    const existente = await prisma.nota.findFirst({
      where: { alunoId: Number(alunoId), materiaId: Number(materiaId), periodo },
      orderBy: { atualizadoEm: "desc" },
    });
    if (existente) {
      const nota = await prisma.nota.update({
        where: { id: existente.id },
        data: { professorId: idProfessor, valor: Number(valor), titulo },
      });
      await registrar(
        req,
        "NOTA_EDITADA",
        "Nota",
        nota.id,
        `Nota bimestral alterada de ${existente.valor.toString()} para ${nota.valor.toString()}`,
        {
          alunoId: Number(alunoId),
          professorId: idProfessor,
          materiaId: Number(materiaId),
          periodo,
          valorAntigo: Number(existente.valor),
          valorNovo: Number(nota.valor),
        },
      );
      return res.json(nota);
    }
    const nota = await prisma.nota.create({
      data: {
        alunoId: Number(alunoId),
        materiaId: Number(materiaId),
        professorId: idProfessor,
        valor: Number(valor),
        titulo,
        periodo,
      },
    });
    await registrar(
      req,
      "NOTA_CRIADA",
      "Nota",
      nota.id,
      `Nota bimestral ${periodo} lançada para o aluno ${alunoId}`,
      {
        alunoId: Number(alunoId),
        professorId: idProfessor,
        materiaId: Number(materiaId),
        periodo,
        valor: Number(valor),
      },
    );
    return res.status(201).json(nota);
  } catch {
    return res.status(400).json({ error: "Não foi possível salvar a nota" });
  }
}

export async function editarNota(req: Request, res: Response) {
  const { valor, titulo, periodo } = req.body ?? {};
  const id = String(req.params.id);
  const ator = usuario(req);
  if (!Number.isInteger(Number(valor)) || !isValidGrade(valor))
    return res.status(400).json({ error: "A nota deve ser um número inteiro entre 0 e 10" });
  if (typeof titulo === "string" && !instrumentosAvaliativos.includes(titulo))
    return res.status(400).json({ error: "Selecione um instrumento avaliativo válido" });
  if (typeof periodo === "string" && !periodosBimestrais.includes(periodo))
    return res.status(400).json({ error: "Selecione um bimestre válido" });
  try {
    const antiga = await prisma.nota.findUnique({ where: { id } });
    if (!antiga) return res.status(404).json({ error: "Nota não encontrada" });
    if (ator.tipo === "PROFESSOR") {
      const atribuido = await prisma.professorMateria.findUnique({
        where: { professorId_materiaId: { professorId: ator.id, materiaId: antiga.materiaId } },
      });
      if (!atribuido)
        return res.status(403).json({ error: "Você só pode editar notas das suas matérias" });
    }
    const nota = await prisma.nota.update({
      where: { id },
      data: {
        valor: Number(valor),
        ...(typeof titulo === "string" ? { titulo } : {}),
        ...(typeof periodo === "string" ? { periodo } : {}),
      },
    });
    await registrar(
      req,
      "NOTA_EDITADA",
      "Nota",
      id,
      `Nota alterada de ${antiga.valor.toString()} para ${nota.valor.toString()}`,
      {
        alunoId: nota.alunoId,
        professorId: nota.professorId,
        materiaId: nota.materiaId,
        valorAntigo: Number(antiga.valor),
        valorNovo: Number(nota.valor),
      },
    );
    return res.json(nota);
  } catch {
    return res.status(500).json({ error: "Não foi possível atualizar a nota" });
  }
}
