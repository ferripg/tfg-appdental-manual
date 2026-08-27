import { randomUUID } from "crypto";
import { getMinioClient, BUCKET_FACTURES } from "@/lib/minio-client";

// El bucket es crea sol la primera vegada que es puja una factura, per no
// obligar a crear-lo a mà des de la consola de MinIO en una instal·lació nova.
let bucketReady: Promise<void> | null = null;

function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const client = getMinioClient();
      if (!(await client.bucketExists(BUCKET_FACTURES))) {
        try {
          await client.makeBucket(BUCKET_FACTURES);
        } catch (error) {
          // Dues peticions simultànies poden intentar crear-lo alhora.
          const code = (error as { code?: string }).code;
          if (code !== "BucketAlreadyOwnedByYou" && code !== "BucketAlreadyExists") {
            throw error;
          }
        }
      }
    })().catch((error) => {
      bucketReady = null; // permet reintentar si MinIO encara no estava llest
      throw error;
    });
  }
  return bucketReady;
}

export async function uploadFactura(
  buffer: Buffer,
  originalFilename: string,
  contentType: string,
): Promise<string> {
  await ensureBucket();

  const extension = originalFilename.split(".").pop() ?? "pdf";
  const fitxerKey = `${randomUUID()}.${extension}`;

  await getMinioClient().putObject(
    BUCKET_FACTURES,
    fitxerKey,
    buffer,
    buffer.length,
    { "Content-Type": contentType },
  );
  return fitxerKey;
}

export async function getPresignedUrl(fitxerKey: string): Promise<string> {
  const expirySeconds = 15 * 60;
  return getMinioClient().presignedGetObject(
    BUCKET_FACTURES,
    fitxerKey,
    expirySeconds,
  );
}

export async function deleteFactura(fitxerKey: string): Promise<void> {
  await getMinioClient().removeObject(BUCKET_FACTURES, fitxerKey);
}
