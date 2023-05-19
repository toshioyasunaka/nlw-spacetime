import { FastifyInstance } from "fastify";
import axios from "axios";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function authRotes(app: FastifyInstance) {
  app.post("/register", async (req) => {
    const bodySchema = z.object({
      code: z.string(), // válidação do código que vem do github
    });

    const { code } = bodySchema.parse(req.body);

    const accessTokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token } = accessTokenResponse.data;

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // validação de dados proveniente do Github
    const userSchema = z.object({
      id: z.number(), // lê-se: em id espera-se um número
      login: z.string(), // lê-se: em login espera-se uma string
      name: z.string(),
      avatar_url: z.string().url(),
    });

    // caso o usuário já exista no banco de dados: (já tenha seu cadastro feito anteriormente)
    const userInfo = userSchema.parse(userResponse.data);

    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id,
      },
    });

    // caso o usuário não exista no banco de dados ainda, ele será cadastrado/criado:
    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url,
        },
      });
    }

    const token = app.jwt.sign(
      {
        // informações dos usuários que estarão contidas dentro do token (públicas - qualquer um poderá ver essas informações, elas não serão codificadas)
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id, // "sub" é uma informação que identifica o usuário
        expiresIn: "30 days", // tempo de expiração do token
      }
    );

    // retorna o token do usuário que está cadastrado no banco de dados com as informações públicas
    return { token };
  });
}
