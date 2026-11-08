import type { Request, Response } from "express";
import prisma from "../database/config";
import { registrar, usuario } from "./utilidadesControladores";

export async function listarMaterias(req: Request, res: Response) {
  const ator = usuario(req);
  try {
    return res.json(
      await prisma.materia.findMany({
        where: {
          ativa: true,
          ...(ator.tipo === "PROFESSOR" ? { professores: { some: { professorId: ator.id } } } : {}),
        },
        orderBy: { nome: "asc" },
        include: { professores: { include: { professor: { select: { id: true, nome: true } } } } },
      }),
    );
  } catch {
    return res.status(500).json({ error: "Não foi possível listar matérias" });
  }
}

export async function criarMateria(req: Request, res: Response) {
  const { nome, codigo } = req.body ?? {};
  if (typeof nome !== "string" || !nome.trim() || typeof codigo !== "string" || !codigo.trim())
    return res.status(400).json({ error: "Informe o nome e o código da matéria" });
  try {
    const m = await prisma.materia.create({
      data: {
        nome: nome.trim(),
        codigo: codigo.trim().toUpperCase(),
        cor: req.body.cor || "#0f766e",
      },
    });
    await registrar(
      req,
      "MATERIA_CRIADA",
      "Materia",
      String(m.id),
      `Criação da matéria ${m.nome}`,
      { materiaId: m.id },
    );
    return res.status(201).json(m);
  } catch {
    return res.status(409).json({ error: "Código ou matéria já cadastrado" });
  }
}
