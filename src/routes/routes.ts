import { Router } from "express";
import { FuncionarioController } from "../controller/funcionarioController";
import { AlunoController } from "../controller/alunoController";
import { NotaController } from "../controller/notaController";
import {
  autenticar,
  exigirAdministrador,
  exigirProfessorOuAdministrador,
} from "../middleware/auth";

const routes = Router();
const funcionarioController = new FuncionarioController();
const alunoController = new AlunoController();
const notaController = new NotaController();

routes.post("/login/", funcionarioController.entrar);
routes.post("/funcionario/", autenticar, exigirAdministrador, funcionarioController.criarFuncionario);
routes.get("/funcionario/", autenticar, exigirAdministrador, funcionarioController.listarFuncionario);
routes.get("/aluno/", autenticar, exigirProfessorOuAdministrador, alunoController.listar);
routes.post("/aluno/", autenticar, exigirAdministrador, alunoController.criar);
routes.get("/aluno/:alunoId/notas/", autenticar, exigirProfessorOuAdministrador, notaController.listarDoAluno);
routes.post("/aluno/:alunoId/notas/", autenticar, exigirProfessorOuAdministrador, notaController.atribuir);
//
export { routes }
