import { Router } from "express";
import { login, trocarSenha, pedirRecuperacao } from "../controller/autenticacaoController";
import { resumo } from "../controller/visaoGeralController";
import { listarAlunos, obterAluno, criarAluno } from "../controller/alunosController";
import { listarEquipe, obterProfessor, criarProfessor } from "../controller/professoresController";
import { listarMaterias, criarMateria } from "../controller/materiasController";
import { listarNotas, atribuirNota, editarNota } from "../controller/notasController";
import {
  solicitarReavaliacao,
  listarReavaliacoes,
  baixarAnexo,
  responderReavaliacao,
} from "../controller/reavaliacoesController";
import {
  listarRecuperacoes,
  resolverRecuperacao,
} from "../controller/solicitacoesAcessoController";
import { logs } from "../controller/auditoriaController";
import { autenticar, permitir } from "../middleware/auth";

const routes = Router();

routes.post("/auth/login", login);
routes.post("/auth/recuperacao", pedirRecuperacao);
routes.use(autenticar);
routes.get("/auth/me", (req, res) => res.json({ usuario: req.usuarioAutenticado }));
routes.post("/auth/senha", trocarSenha);
routes.get("/dashboard", resumo);

routes.get("/alunos", permitir("ADMIN", "PROFESSOR"), listarAlunos);
routes.get("/alunos/:id", permitir("ADMIN"), obterAluno);
routes.get("/equipe", permitir("ADMIN"), listarEquipe);
routes.post("/alunos", permitir("ADMIN"), criarAluno);
routes.post("/professores", permitir("ADMIN"), criarProfessor);
routes.get("/professores/:id", permitir("ADMIN"), obterProfessor);
routes.get("/materias", listarMaterias);
routes.post("/materias", permitir("ADMIN"), criarMateria);

routes.get("/notas", listarNotas);
routes.post("/notas", permitir("ADMIN", "PROFESSOR"), atribuirNota);
routes.patch("/notas/:id", permitir("ADMIN", "PROFESSOR"), editarNota);
routes.post("/reavaliacoes", permitir("ALUNO"), solicitarReavaliacao);
routes.get("/reavaliacoes", listarReavaliacoes);
routes.get("/reavaliacoes/anexos/:id", baixarAnexo);
routes.patch("/reavaliacoes/:id", permitir("PROFESSOR"), responderReavaliacao);
routes.get("/recuperacoes", permitir("ADMIN"), listarRecuperacoes);
routes.patch("/recuperacoes/:id", permitir("ADMIN"), resolverRecuperacao);
routes.get("/auditoria", permitir("ADMIN"), logs);

export { routes };
