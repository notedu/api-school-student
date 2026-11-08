import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../database/config";
import { isValidCpf, isValidPassword } from "../domainRules";
import { numeroPositivo, registrar } from "./utilidadesControladores";

export async function listarEquipe(_req: Request, res: Response) {
  try {
    const [professores, administradores] = await Promise.all([
      prisma.professor.findMany({
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, cpf: true },
      }),
      prisma.administrador.findMany({
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, cpf: true, cargo: true },
      }),
    ]);
    return res.json([
      ...professores.map((p) => ({ ...p, tipo: "Professor" })),
      ...administradores.map((a) => ({
        ...a,
        tipo: a.cargo === "DIRETOR" ? "Diretor" : "Coordenador",
      })),
    ]);
  } catch {
    return res.status(500).json({ error: "Não foi possível consultar a equipe" });
  }
}

export async function obterProfessor(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!numeroPositivo(id))
    return res.status(400).json({ error: "Identificador de professor inválido" });
  try {
    const professor = await prisma.professor.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        idade: true,
        cpf: true,
        dataNascimento: true,
        cep: true,
        rua: true,
        bairro: true,
        cidade: true,
        estado: true,
        numeroCasa: true,
        complemento: true,
        criadoEm: true,
        materias: {
          orderBy: { materia: { nome: "asc" } },
          select: { materia: { select: { id: true, nome: true, codigo: true, ativa: true } } },
        },
        reavaliacoes: {
          orderBy: { criadoEm: "desc" },
          select: {
            id: true,
            motivo: true,
            status: true,
            valorAnterior: true,
            valorAtribuido: true,
            motivoRecusa: true,
            criadoEm: true,
            respondidoEm: true,
            aluno: { select: { id: true, nome: true, ra: true } },
            nota: {
              select: {
                id: true,
                titulo: true,
                periodo: true,
                materia: { select: { id: true, nome: true } },
              },
            },
          },
        },
      },
    });
    if (!professor) return res.status(404).json({ error: "Professor não encontrado" });
    return res.json(professor);
  } catch {
    return res.status(500).json({ error: "Não foi possível carregar os dados do professor" });
  }
}

export async function criarProfessor(req: Request, res: Response) {
  const b = req.body ?? {};
  const campos = [
    "nome",
    "cpf",
    "password",
    "dataNascimento",
    "rua",
    "bairro",
    "cidade",
    "estado",
    "numeroCasa",
  ];
  if (
    campos.some((c) => typeof b[c] !== "string" || !b[c].trim()) ||
    !isValidCpf(b.cpf) ||
    !isValidPassword(b.password) ||
    !numeroPositivo(b.idade) ||
    !Array.isArray(b.materiaIds) ||
    b.materiaIds.length === 0
  )
    return res
      .status(400)
      .json({
        error: "Preencha os dados do professor, CPF válido, senha forte e ao menos uma matéria",
      });
  try {
    const created = await prisma.professor.create({
      data: {
        nome: b.nome.trim(),
        cpf: b.cpf.replace(/\D/g, ""),
        idade: Number(b.idade),
        password: await bcrypt.hash(b.password, 12),
        dataNascimento: new Date(b.dataNascimento),
        cep: b.cep || null,
        rua: b.rua.trim(),
        bairro: b.bairro.trim(),
        cidade: b.cidade.trim(),
        estado: b.estado.trim(),
        numeroCasa: b.numeroCasa.trim(),
        complemento: b.complemento || null,
        materias: {
          create: b.materiaIds.map((materiaId: number) => ({ materiaId: Number(materiaId) })),
        },
      },
      select: { id: true, nome: true, cpf: true },
    });
    await registrar(
      req,
      "PROFESSOR_CRIADO",
      "Professor",
      String(created.id),
      `Cadastro de ${created.nome}`,
      { professorId: created.id },
    );
    return res.status(201).json(created);
  } catch {
    return res
      .status(400)
      .json({ error: "Não foi possível cadastrar o professor. Verifique CPF e matérias" });
  }
}
