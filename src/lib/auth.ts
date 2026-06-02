import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { prisma } from "@/repositories/prisma-client";
import { createAuthMiddleware, APIError } from "better-auth/api";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost", "http://localhost:3000"],
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "OPERARI" },
      actiu: { type: "boolean", required: false, defaultValue: true },
      mustChangePassword: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      failedLoginAttempts: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      lastLoginAt: { type: "date", required: false },
      lockedUntil: { type: "date", required: false },
    },
  },
  plugins: [
    admin({
      defaultRole: "OPERARI",
      adminRoles: ["ADMIN"],
    }),
    nextCookies(),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const email = ctx.body?.email;
      if (!email) return;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return;

      // FORBIDDEN (403): l'usuari existeix però no se li permet entrar.
      // Es distingeix d'UNAUTHORIZED (401, credencials incorrectes) al login.
      if (!user.actiu) {
        throw new APIError("FORBIDDEN", { message: "Compte desactivat" });
      }
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new APIError("FORBIDDEN", {
          message: "Compte bloquejat temporalment. Torna-ho a provar més tard.",
        });
      }
    }),

    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const email = ctx.body?.email;
      if (!email) return;

      if (ctx.context.newSession) {
        await prisma.user.update({
          where: { email },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });
      } else {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return;
        const attempts = user.failedLoginAttempts + 1;
        await prisma.user.update({
          where: { email },
          data: {
            failedLoginAttempts: attempts,
            lockedUntil:
              attempts >= 5
                ? new Date(Date.now() + 15 * 60 * 1000)
                : user.lockedUntil,
          },
        });
      }
    }),
  },
});
