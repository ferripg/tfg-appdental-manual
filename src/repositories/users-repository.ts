import { prisma } from "./prisma-client";
import { Role } from "@prisma/client";

export async function findByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  return user;
}

export async function create(data: {
  email: string;
  password: string;
  name?: string;
  role?: Role;
}) {
  const user = await prisma.user.create({
    data: data,
  });
  return user;
}
