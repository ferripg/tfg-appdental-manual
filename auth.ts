import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/repositories/prisma-client";
import authConfig from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import * as authService from "@/services/auth-service";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    Credentials({
      authorize: async (credentials) => {
        return await authService.validateCredentials(
          credentials.email as string,
          credentials.password as string,
        );
      },
    }),
  ],
});
