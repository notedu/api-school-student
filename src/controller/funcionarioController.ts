import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../database/config";
import { getJwtSecret } from "../middleware/auth";

export class FuncionarioController {
  async entrar(req: Request, res: Response) {
    const { usuario, password } = req.body ?? {};
    if (typeof usuario !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Informe usuário e senha" });
    }

    try {
      const funcionario = await prisma.funcionario.findUnique({
        where: { usuario },
      });

      if (!funcionario || !(await bcrypt.compare(password, funcionario.password))) {
        return res.status(401).json({ error: "Usuário ou senha inválidos" });
      }

      const token = jwt.sign(
        { cargo: funcionario.cargo },
        getJwtSecret(),
        { subject: String(funcionario.id), expiresIn: "1h" },
      );

      return res.json({
        token,
        funcionario: {
          id: funcionario.id,
          nome: funcionario.nome,
          usuario: funcionario.usuario,
          cargo: funcionario.cargo,
        },
      });
    } catch {
      return res.status(500).json({ error: "Erro ao realizar login" });
    }
  }

  async criarFuncionario(req: Request, res: Response) {
    const { nome, usuario, password } = req.body ?? {};
    if (
      typeof nome !== "string" || !nome.trim() ||
      typeof usuario !== "string" || !usuario.trim() ||
      typeof password !== "string" || password.length < 12
    ) {
      return res.status(400).json({
        error: "Informe nome, usuário e senha com pelo menos 12 caracteres",
      });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 12);
      const funcionario = await prisma.funcionario.create({
        data: {
          nome: nome.trim(),
          usuario: usuario.trim(),
          password: passwordHash,
          cargo: "PROFESSOR",
        },
        select: {
          id: true,
          nome: true,
          usuario: true,
          cargo: true,
          criadoEm: true,
        },
      });

      return res.status(201).json(funcionario);
    } catch (error) {
      if (
        typeof error === "object" && error !== null &&
        "code" in error && error.code === "P2002"
      ) {
        return res.status(409).json({ error: "Esse usuário já está cadastrado" });
      }

      return res.status(500).json({ error: "Erro ao criar funcionário" });
    }
  }

  async listarFuncionario(_req: Request, res: Response) {
    try {
      const funcionarios = await prisma.funcionario.findMany({
        orderBy: { criadoEm: "desc" },
        select: {
          id: true,
          nome: true,
          usuario: true,
          cargo: true,
          criadoEm: true,
        },
      });

      return res.json(funcionarios);
    } catch {
      return res.status(500).json({ error: "Erro ao buscar funcionários" });
    }
  }
}
