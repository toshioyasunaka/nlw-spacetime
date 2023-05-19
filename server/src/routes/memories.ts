import { FastifyInstance } from "fastify";
import { z } from "zod"; // validação

import { prisma } from "../lib/prisma";

export async function memoriesRoutes(app: FastifyInstance) {
  // antes de executar o método de cada uma das rotas, verifica se o usuário está autenticado
  app.addHook("preHandler", async (req) => {
    await req.jwtVerify(); // verifica se na requisição do front-end está vindo um token de autenticação, caso não vier a autenticação é bloqueada
  });

  app.get("/memories", async (req) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: req.user.sub, // listará as memórias apenas onde "userId" será igual a "req.user.sub" - id do usuário
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat("..."),
      };
    });
  });

  app.get("/memories/:id", async (req, reply) => {
    // validação do Zod
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(req.params); // validação através do Zod que verifica se req.params segue o schema(estrutura do dado) de "paramsSchema"

    // findUniqueOrThrow() é um método auxiliar do prisma que retorna a memória com o ID passado ou dispara um erro caso não encontrar
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (!memory.isPublic && memory.userId !== req.user.sub) {
      return reply.status(401).send();
    }

    return memory;
  });

  app.post("/memories", async (req) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false), // "coerce" converte o valor que chega para boolean, isso porque no corpo da requisição geralmente não se tem booleanos. Quando enviamos uma informação para o back-end, geralmente é através de strings e números. Então, para se certificar de que será enviada como um booleano, utiliza-se o "coerce" p/ fazer sua conversão
    });

    const { content, coverUrl, isPublic } = bodySchema.parse(req.body);

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: req.user.sub, // enviará as memórias apenas onde "userId" será igual a "req.user.sub" - id do usuário
      },
    });

    return memory;
  });

  app.put("/memories/:id", async (req, reply) => {
    // Validação dos parâmetros
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(req.params);

    // Validação do corpo
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    });

    const { content, coverUrl, isPublic } = bodySchema.parse(req.body);

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (memory.userId !== req.user.sub) {
      return reply.status(401).send();
    }

    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    });

    return memory;
  });

  app.delete("/memories/:id", async (req, reply) => {
    // validação do Zod
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(req.params); // validação através do Zod que verifica se req.params segue o schema(estrutura do dado) de "paramsSchema"

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (memory.userId !== req.user.sub) {
      return reply.status(401).send();
    }

    // findUniqueOrThrow() é um método auxiliar do prisma que retorna a memória com o ID passado ou dispara um erro caso não encontrar
    await prisma.memory.delete({
      where: {
        id,
      },
    });
  });
}
