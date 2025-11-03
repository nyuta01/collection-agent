import { S3Client, GetObjectCommand, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import type { StoredItem } from './types';

// MinIO client configuration
const s3Client = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`,
  region: 'us-east-1', // MinIO requires a region, but can be any value
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'collections';

/**
 * Ensure the MinIO bucket exists, create if it doesn't
 */
async function ensureBucket(): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (error) {
    // Bucket doesn't exist, create it
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
  }
}

/**
 * Get the S3 key for a collection's items file
 */
function getCollectionKey(collectionId: string): string {
  return `collections/${collectionId}.json`;
}

/**
 * Load items array from MinIO for a specific collection
 * Returns empty array if file doesn't exist
 */
export async function loadItems(collectionId: string): Promise<StoredItem[]> {
  await ensureBucket();

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: getCollectionKey(collectionId),
    });

    const response = await s3Client.send(command);
    const bodyString = await response.Body?.transformToString();

    if (!bodyString) {
      return [];
    }

    const items = JSON.parse(bodyString);

    if (!Array.isArray(items)) {
      throw new Error('Invalid items file format: expected array');
    }

    return items;
  } catch (error: unknown) {
    // If file doesn't exist, return empty array
    if (error && typeof error === 'object' && 'name' in error && error.name === 'NoSuchKey') {
      return [];
    }
    throw error;
  }
}

/**
 * Save items array to MinIO for a specific collection
 */
export async function saveItems(collectionId: string, items: unknown[]): Promise<void> {
  await ensureBucket();

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: getCollectionKey(collectionId),
    Body: JSON.stringify(items, null, 2),
    ContentType: 'application/json',
  });

  await s3Client.send(command);
}
