import { randomUUID } from "crypto";
import { getMinioClient, BUCKET_FACTURES } from "@/lib/minio-client";

export async function uploadFactura(
  buffer: Buffer,
  originalFilename: string,
  contentType: string,
): Promise<string> {
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
