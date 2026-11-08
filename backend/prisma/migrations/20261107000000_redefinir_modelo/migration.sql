-- CreateEnum
CREATE TYPE "CargoAdministrador" AS ENUM ('DIRETOR', 'COORDENADOR');

-- CreateEnum
CREATE TYPE "TipoConta" AS ENUM ('ALUNO', 'PROFESSOR');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADA', 'RECUSADA');

-- CreateEnum
CREATE TYPE "StatusReavaliacao" AS ENUM ('PENDENTE', 'APROVADA', 'RECUSADA');

-- DropForeignKey
ALTER TABLE "Nota" DROP CONSTRAINT "Nota_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "Nota" DROP CONSTRAINT "Nota_funcionarioId_fkey";

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "bairro" TEXT NOT NULL,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataNascimento" DATE NOT NULL,
ADD COLUMN     "deveTrocarSenha" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estado" TEXT NOT NULL,
ADD COLUMN     "numeroCasa" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "ra" TEXT NOT NULL,
ADD COLUMN     "responsavelLegal" TEXT NOT NULL,
ADD COLUMN     "rua" TEXT NOT NULL,
ADD COLUMN     "senhaTemporariaExpiraEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Nota" DROP COLUMN "funcionarioId",
ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "materiaId" INTEGER NOT NULL,
ADD COLUMN     "periodo" TEXT NOT NULL,
ADD COLUMN     "professorId" INTEGER NOT NULL,
ADD COLUMN     "titulo" TEXT NOT NULL,
ALTER COLUMN "valor" SET DATA TYPE DECIMAL(4,2);

-- DropTable
DROP TABLE "Funcionario";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Professor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "cpf" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dataNascimento" DATE NOT NULL,
    "cep" TEXT,
    "rua" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "numeroCasa" TEXT NOT NULL,
    "complemento" TEXT,
    "deveTrocarSenha" BOOLEAN NOT NULL DEFAULT false,
    "senhaTemporariaExpiraEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administrador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "cpf" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dataNascimento" DATE NOT NULL,
    "cargo" "CargoAdministrador" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#0f766e',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessorMateria" (
    "professorId" INTEGER NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "atribuidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfessorMateria_pkey" PRIMARY KEY ("professorId","materiaId")
);

-- CreateTable
CREATE TABLE "PedidoReavaliacao" (
    "id" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "status" "StatusReavaliacao" NOT NULL DEFAULT 'PENDENTE',
    "valorAnterior" DECIMAL(4,2) NOT NULL,
    "valorAtribuido" DECIMAL(4,2),
    "motivoRecusa" TEXT,
    "alunoId" INTEGER NOT NULL,
    "notaId" TEXT NOT NULL,
    "professorId" INTEGER NOT NULL,
    "respondidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedidoReavaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnexoReavaliacao" (
    "id" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "tipoConteudo" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "conteudo" BYTEA NOT NULL,
    "reavaliacaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnexoReavaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoRecuperacaoSenha" (
    "id" TEXT NOT NULL,
    "tipoConta" "TipoConta" NOT NULL,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "identificador" TEXT NOT NULL,
    "alunoId" INTEGER,
    "professorId" INTEGER,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvidaEm" TIMESTAMP(3),

    CONSTRAINT "SolicitacaoRecuperacaoSenha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "atorTipo" TEXT NOT NULL,
    "atorId" INTEGER NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "alunoId" INTEGER,
    "professorId" INTEGER,
    "materiaId" INTEGER,
    "descricao" TEXT NOT NULL,
    "dados" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Professor_cpf_key" ON "Professor"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_cpf_key" ON "Administrador"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Materia_nome_key" ON "Materia"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Materia_codigo_key" ON "Materia"("codigo");

-- CreateIndex
CREATE INDEX "PedidoReavaliacao_status_criadoEm_idx" ON "PedidoReavaliacao"("status", "criadoEm");

-- CreateIndex
CREATE INDEX "PedidoReavaliacao_alunoId_idx" ON "PedidoReavaliacao"("alunoId");

-- CreateIndex
CREATE INDEX "PedidoReavaliacao_professorId_idx" ON "PedidoReavaliacao"("professorId");

-- CreateIndex
CREATE INDEX "AnexoReavaliacao_reavaliacaoId_idx" ON "AnexoReavaliacao"("reavaliacaoId");

-- CreateIndex
CREATE INDEX "SolicitacaoRecuperacaoSenha_status_criadaEm_idx" ON "SolicitacaoRecuperacaoSenha"("status", "criadaEm");

-- CreateIndex
CREATE INDEX "LogAuditoria_criadoEm_idx" ON "LogAuditoria"("criadoEm");

-- CreateIndex
CREATE INDEX "LogAuditoria_entidade_entidadeId_idx" ON "LogAuditoria"("entidade", "entidadeId");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_cpf_key" ON "Aluno"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_ra_key" ON "Aluno"("ra");

-- CreateIndex
CREATE INDEX "Nota_alunoId_idx" ON "Nota"("alunoId");

-- CreateIndex
CREATE INDEX "Nota_professorId_materiaId_idx" ON "Nota"("professorId", "materiaId");

-- CreateIndex
CREATE UNIQUE INDEX "Nota_alunoId_materiaId_periodo_titulo_key" ON "Nota"("alunoId", "materiaId", "periodo", "titulo");

-- AddForeignKey
ALTER TABLE "ProfessorMateria" ADD CONSTRAINT "ProfessorMateria_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorMateria" ADD CONSTRAINT "ProfessorMateria_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoReavaliacao" ADD CONSTRAINT "PedidoReavaliacao_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoReavaliacao" ADD CONSTRAINT "PedidoReavaliacao_notaId_fkey" FOREIGN KEY ("notaId") REFERENCES "Nota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoReavaliacao" ADD CONSTRAINT "PedidoReavaliacao_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnexoReavaliacao" ADD CONSTRAINT "AnexoReavaliacao_reavaliacaoId_fkey" FOREIGN KEY ("reavaliacaoId") REFERENCES "PedidoReavaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoRecuperacaoSenha" ADD CONSTRAINT "SolicitacaoRecuperacaoSenha_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoRecuperacaoSenha" ADD CONSTRAINT "SolicitacaoRecuperacaoSenha_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
