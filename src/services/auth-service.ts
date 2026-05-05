import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as userRepository from "@/repositories/users-repository";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}

export async function validateCredentials(email: string, password: string) {
  const user = await userRepository.findByEmail(email);
  if (!user) return null;
  if (!user.password) return null;

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return null;

  return user;
}

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  role?: Role;
}) {
  const hash = await hashPassword(data.password);
  return userRepository.create({ ...data, password: hash });
}
