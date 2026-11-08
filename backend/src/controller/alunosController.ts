import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../database/config";
import { isValidCpf, isValidPassword } from "../domainRules";
import { numeroPositivo, registrar } from "./utilidadesControladores";

export async function listarAlunos(_req: Request, res: Response) {
  try {
    return res.json(
      await prisma.aluno.findMany({
        orderBy: { nome: "asc" },
        select: {
          id: true,
          nome: true,
          idade: true,
          cpf: true,
          ra: true,
          cidade: true,
          notas: { select: { valor: true } },
        },
      }),
    );
  } catch {
    return res.status(500).json({ error: "Não foi possível listar alunos" });
  }
}

export async function obterAluno(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!numeroPositivo(id))
    return res.status(400).json({ error: "Identificador de aluno inválido" });
  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        idade: true,
        cpf: true,
        ra: true,
        responsavelLegal: true,
        dataNascimento: true,
        cep: true,
        rua: true,
        bairro: true,
        cidade: true,
        estado: true,
        numeroCasa: true,
        complemento: true,
        criadoEm: true,
        notas: {
          orderBy: [{ periodo: "asc" }, { materia: { nome: "asc" } }],
          select: {
            id: true,
            titulo: true,
            periodo: true,
            valor: true,
            materia: { select: { id: true, nome: true, codigo: true } },
            professor: { select: { id: true, nome: true } },
            reavaliacoes: {
              select: {
                id: true,
                status: true,
                valorAnterior: true,
                valorAtribuido: true,
                motivoRecusa: true,
                criadoEm: true,
                respondidoEm: true,
              },
            },
          },
        },
      },
    });
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });
    return res.json(aluno);
  } catch {
    return res.status(500).json({ error: "Não foi possível carregar os dados do aluno" });
  }
}

export async function criarAluno(req: Request, res: Response) {
  const b = req.body ?? {};
  const campos = [
    "nome",
    "cpf",
    "ra",
    "responsavelLegal",
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
    !numeroPositivo(b.idade) ||
    !isValidCpf(b.cpf) ||
    !isValidPassword(b.password)
  )
    return res
      .status(400)
      .json({ error: "Preencha os dados obrigatórios, informe CPF válido e uma senha forte" });
  try {
    const created = await prisma.aluno.create({
      data: {
        nome: b.nome.trim(),
        cpf: b.cpf.replace(/\D/g, ""),
        ra: b.ra.trim(),
        idade: Number(b.idade),
        responsavelLegal: b.responsavelLegal.trim(),
        password: await bcrypt.hash(b.password, 12),
        dataNascimento: new Date(b.dataNascimento),
        cep: b.cep || null,
        rua: b.rua.trim(),
        bairro: b.bairro.trim(),
        cidade: b.cidade.trim(),
        estado: b.estado.trim(),
        numeroCasa: b.numeroCasa.trim(),
        complemento: b.complemento || null,
      },
      select: { id: true, nome: true, ra: true },
    });
    await registrar(
      req,
      "ALUNO_CRIADO",
      "Aluno",
      String(created.id),
      `Cadastro de ${created.nome}`,
      { alunoId: created.id },
    );
    return res.status(201).json(created);
  } catch {
    return res
      .status(400)
      .json({ error: "Não foi possível cadastrar. Verifique RA, CPF e data de nascimento" });
  }
}
