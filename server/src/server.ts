import "dotenv/config"; // importação e conversão das variáveis de ambiente p/ habilitar o "process.env" no backend

import fastify from "fastify";
import cors from "@fastify/cors"; // técnica de segurança que filtra quais URL's que vem do front-end poderá acessar a api
import jwt from "@fastify/jwt";

// Rotas
import { memoriesRoutes } from "./routes/memories";
import { authRotes } from "./routes/auth";

const app = fastify();

app.register(cors, {
  origin: true, // todas as URL's de front-end poderão acessar o back-end
});

app.register(jwt, {
  secret: "spacetime", // maneira de diferenciar os tokens gerados por esse backend quando comparados a outros tokens gerados por outros backends. Uma forma de criptografar
});

app.register(authRotes);
app.register(memoriesRoutes);

app.listen({ port: 3333 }).then(() => {
  console.log("🚀 HTTP server running on http://localhost:3333");
});
