// Principais (Express, Cors e Dotenv)
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { routes } from "./src/routes/routes";
import { getJwtSecret } from "./src/middleware/auth";

getJwtSecret();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(routes);

// GET de API rodando
app.get("/health/", (req: Request, res: Response) => {
    res.json({message: "API ligada e funcionando!"});
});

// Ligando o servidor
app.listen(port, () => {
    console.log(`Servidor ligado e rodando em http://localhost:${port}`);
})
