import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not set.");
  return bucket;
}

function getPublicUrl(filePath: string): string {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!base) throw new Error("R2_PUBLIC_URL is not set.");
  return `${base}/${filePath}`;
}

export async function storagePut(
  filePath: string,
  fileBuffer: Buffer,
  contentType = "application/octet-stream"
): Promise<{ url: string; path: string }> {
  const client = getR2Client();
  const bucket = getBucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: filePath,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    })
  );

  const url = getPublicUrl(filePath);
  console.log(`[R2 Storage] Uploaded: ${filePath}`);
  return { url, path: filePath };
}

export async function storageDelete(filePath: string): Promise<boolean> {
  const client = getR2Client();
  const bucket = getBucketName();

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: filePath }));
  console.log(`[R2 Storage] Deleted: ${filePath}`);
  return true;
}

export function getStorageUrl(filePath: string): string {
  return getPublicUrl(filePath);
}

export async function storageExists(filePath: string): Promise<boolean> {
  try {
    const client = getR2Client();
    const bucket = getBucketName();
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: filePath }));
    return true;
  } catch {
    return false;
  }
}
