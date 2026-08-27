import { Client } from "minio";

export const BUCKET_FACTURES = "factures";

let client: Client | null = null;

// Inicialització mandrosa: si construíssim el Client a l'arrel del mòdul,
// el `next build` (que no té les variables d'entorn) petaria en importar-lo.
export function getMinioClient(): Client {
  if (client) return client;

  const endPoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ROOT_USER;
  const secretKey = process.env.MINIO_ROOT_PASSWORD;

  if (!endPoint || !accessKey || !secretKey) {
    throw new Error(
      "Falten variables d'entorn de MinIO: MINIO_ENDPOINT, MINIO_ROOT_USER i MINIO_ROOT_PASSWORD",
    );
  }

  client = new Client({
    endPoint,
    port: Number(process.env.MINIO_PORT ?? 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey,
    secretKey,
  });

  return client;
}
