import "@fastify/jwt";

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    // declaração de quais informações existem dentro de user que será utilizado "req.user" em "memories.ts". Isso porque o typescript não consegue reconhecer quais informações estão contidas dentro "user". Ela é escolhida pelo desenvolvedor em "auth.ts" na const "token"
    user: {
      sub: string;
      name: string;
      avatarUrl: string;
    };
  }
}
