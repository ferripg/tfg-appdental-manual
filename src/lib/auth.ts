import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { prisma } from "@/repositories/prisma-client";

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
    },
  },
  plugins: [
    admin({
      defaultRole: "OPERARI",
      adminRoles: ["ADMIN"],
    }),
    nextCookies(),
  ],
});
