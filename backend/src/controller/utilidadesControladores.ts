import type { Request } from "express";
import prisma from "../database/config";

export const numeroPositivo = (value: unknown) =>
  Number.isSafeInteger(Number(value)) && Number(value) > 0;
export const usuario = (req: Request) => req.usuarioAutenticado!;
export const periodosBimestrais = ["1º bimestre", "2º bimestre", "3º bimestre", "4º bimestre"];
export const instrumentosAvaliativos = [
  "Média bimestral consolidada",
  "Prova bimestral",
  "Trabalho",
  "Projeto",
  "Seminário",
  "Pesquisa",
  "Produção textual",
  "Portfólio",
  "Recuperação bimestral",
];

export async function registrar(
  req: Request,
  acao: string,
  entidade: string,
  entidadeId: string,
  descricao: string,
  extra: Record<string, unknown> = {},
) {
  const ator = usuario(req);
  await prisma.logAuditoria.create({
    data: {
      atorTipo: ator.tipo,
      atorId: ator.id,
      acao,
      entidade,
      entidadeId,
      alunoId: typeof extra.alunoId === "number" ? extra.alunoId : undefined,
      professorId: typeof extra.professorId === "number" ? extra.professorId : undefined,
      materiaId: typeof extra.materiaId === "number" ? extra.materiaId : undefined,
      descricao,
      dados: JSON.parse(JSON.stringify(extra)),
    },
  });
}
