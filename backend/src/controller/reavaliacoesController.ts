import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../database/config";
import { isValidEvidence, isValidGrade, normalizeCpf } from "../domainRules";
import { registrar, usuario } from "./utilidadesControladores";

export async function solicitarReavaliacao(req: Request, res: Response) {
  const { notaId, motivo, anexos } = req.body ?? {};
  const aluno = usuario(req);
  if (aluno.tipo !== "ALUNO")
    return res.status(403).json({ error: "Somente alunos podem solicitar reavaliação" });
  if (
    typeof notaId !== "string" ||
    typeof motivo !== "string" ||
    motivo.trim().length < 10 ||
    !Array.isArray(anexos) ||
    anexos.length > 5
  )
    return res
      .status(400)
      .json({ error: "Informe a nota, explique o motivo e anexe até 5 arquivos" });
  try {
    const nota = await prisma.nota.findUnique({ where: { id: notaId } });
    if (!nota || nota.alunoId !== aluno.id)
      return res.status(404).json({ error: "Nota não encontrada" });
    if (Number(nota.valor) >= 6)
      return res
        .status(400)
        .json({ error: "A reavaliação está disponível para notas abaixo de 6,0" });
    const recusada = await prisma.pedidoReavaliacao.findFirst({
      where: { notaId, status: "RECUSADA" },
      select: { id: true },
    });
    if (recusada)
      return res
        .status(409)
        .json({
          error: "Esta nota já teve uma reavaliação recusada e não pode receber outro pedido",
        });
    const existentes = await prisma.pedidoReavaliacao.count({
      where: { notaId, status: "PENDENTE" },
    });
    if (existentes)
      return res.status(409).json({ error: "Já existe uma solicitação pendente para esta nota" });
    const files = anexos.map(
      (file: { nomeArquivo?: string; tipoConteudo?: string; base64?: string }) => {
        if (
          !file ||
          typeof file.nomeArquivo !== "string" ||
          typeof file.base64 !== "string" ||
          typeof file.tipoConteudo !== "string"
        )
          throw new Error("Arquivo inválido");
        const raw = file.base64.replace(/^data:[^;]+;base64,/, "");
        const content = Buffer.from(raw, "base64");
        if (!isValidEvidence(file.tipoConteudo, content.length))
          throw new Error("Envie PDF ou imagem com até 5 MB por arquivo");
        return {
          nomeArquivo: file.nomeArquivo.slice(0, 180),
          tipoConteudo: file.tipoConteudo!,
          tamanhoBytes: content.length,
          conteudo: content,
        };
      },
    );
    if (files.reduce((total, file) => total + file.tamanhoBytes, 0) > 20 * 1024 * 1024)
      throw new Error("Os anexos devem somar até 20 MB");
    const pedido = await prisma.pedidoReavaliacao.create({
      data: {
        alunoId: aluno.id,
        notaId,
        professorId: nota.professorId,
        motivo: motivo.trim(),
        valorAnterior: nota.valor,
        anexos: { create: files },
      },
      include: {
        nota: { include: { materia: true } },
        anexos: { select: { id: true, nomeArquivo: true, tipoConteudo: true, tamanhoBytes: true } },
      },
    });
    await registrar(
      req,
      "REAVALIACAO_SOLICITADA",
      "PedidoReavaliacao",
      pedido.id,
      `Pedido para ${pedido.nota.materia.nome}, nota ${pedido.valorAnterior.toString()}`,
      {
        alunoId: aluno.id,
        professorId: nota.professorId,
        materiaId: nota.materiaId,
        valorAntigo: Number(pedido.valorAnterior),
        motivo: motivo.trim(),
        arquivos: files.map((f) => f.nomeArquivo),
      },
    );
    return res.status(201).json(pedido);
  } catch (error) {
    return res
      .status(400)
      .json({
        error: error instanceof Error ? error.message : "Não foi possível enviar a solicitação",
      });
  }
}

export async function listarReavaliacoes(req: Request, res: Response) {
  const u = usuario(req);
  const where =
    u.tipo === "ALUNO" ? { alunoId: u.id } : u.tipo === "PROFESSOR" ? { professorId: u.id } : {};
  try {
    return res.json(
      await prisma.pedidoReavaliacao.findMany({
        where,
        orderBy: { criadoEm: "desc" },
        include: {
          aluno: { select: { id: true, nome: true, ra: true } },
          professor: { select: { id: true, nome: true } },
          nota: { include: { materia: { select: { nome: true, codigo: true } } } },
          anexos: {
            select: { id: true, nomeArquivo: true, tipoConteudo: true, tamanhoBytes: true },
          },
        },
      }),
    );
  } catch {
    return res.status(500).json({ error: "Não foi possível consultar as reavaliações" });
  }
}

export async function baixarAnexo(req: Request, res: Response) {
  const u = usuario(req);
  try {
    const anexo = await prisma.anexoReavaliacao.findUnique({
      where: { id: String(req.params.id) },
      include: { reavaliacao: true },
    });
    if (!anexo) return res.status(404).json({ error: "Anexo não encontrado" });
    if (
      (u.tipo === "ALUNO" && anexo.reavaliacao.alunoId !== u.id) ||
      (u.tipo === "PROFESSOR" && anexo.reavaliacao.professorId !== u.id)
    )
      return res.status(403).json({ error: "Acesso negado" });
    res.setHeader("Content-Type", anexo.tipoConteudo);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(anexo.nomeArquivo)}`,
    );
    return res.send(anexo.conteudo);
  } catch {
    return res.status(500).json({ error: "Não foi possível baixar o anexo" });
  }
}

export async function responderReavaliacao(req: Request, res: Response) {
  const { aprovar, valor, motivoRecusa, cpf, password } = req.body ?? {};
  const u = usuario(req);
  if (u.tipo !== "PROFESSOR")
    return res
      .status(403)
      .json({ error: "Somente o professor responsável pode decidir a reavaliação" });
  if (typeof aprovar !== "boolean" || typeof cpf !== "string" || typeof password !== "string")
    return res.status(400).json({ error: "Confirme a decisão com CPF e senha" });
  if (aprovar && (!Number.isInteger(Number(valor)) || !isValidGrade(valor)))
    return res.status(400).json({ error: "Informe uma nota inteira entre 0 e 10" });
  if (!aprovar && (typeof motivoRecusa !== "string" || motivoRecusa.trim().length < 5))
    return res.status(400).json({ error: "Explique o motivo da recusa" });
  try {
    const prof = await prisma.professor.findUnique({ where: { id: u.id } });
    if (!prof || prof.cpf !== normalizeCpf(cpf) || !(await bcrypt.compare(password, prof.password)))
      return res.status(401).json({ error: "CPF ou senha incorretos" });
    const pedido = await prisma.pedidoReavaliacao.findUnique({
      where: { id: String(req.params.id) },
      include: { nota: true },
    });
    if (!pedido) return res.status(404).json({ error: "Solicitação não encontrada" });
    if (pedido.professorId !== u.id)
      return res.status(403).json({ error: "Esta solicitação não pertence às suas matérias" });
    if (pedido.status !== "PENDENTE")
      return res.status(409).json({ error: "Esta solicitação já foi respondida" });
    const status = aprovar ? "APROVADA" : "RECUSADA";
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.pedidoReavaliacao.update({
        where: { id: pedido.id },
        data: {
          status,
          valorAtribuido: aprovar ? Number(valor) : null,
          motivoRecusa: aprovar ? null : motivoRecusa.trim(),
          respondidoEm: new Date(),
        },
      });
      if (aprovar)
        await tx.nota.update({ where: { id: pedido.notaId }, data: { valor: Number(valor) } });
      await tx.logAuditoria.create({
        data: {
          atorTipo: u.tipo,
          atorId: u.id,
          acao: `REAVALIACAO_${status}`,
          entidade: "PedidoReavaliacao",
          entidadeId: p.id,
          alunoId: pedido.alunoId,
          professorId: u.id,
          materiaId: pedido.nota.materiaId,
          descricao: aprovar
            ? `Reavaliação aprovada: ${pedido.valorAnterior.toString()} → ${valor}`
            : `Reavaliação recusada: ${motivoRecusa.trim()}`,
          dados: {
            valorAntigo: Number(pedido.valorAnterior),
            valorAtribuido: aprovar ? Number(valor) : null,
            aprovada: aprovar,
            motivoRecusa: aprovar ? null : motivoRecusa.trim(),
          },
        },
      });
      return p;
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: "Não foi possível decidir a reavaliação" });
  }
}
