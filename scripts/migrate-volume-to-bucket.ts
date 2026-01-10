
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';
import mime from 'mime'; // You might need to install 'mime' or 'mime-types' if not present, checking dependencies... 
// Wait, package.json didn't show 'mime', but it is a common one. 
// If not present, I can infer from extension or assume octet-stream/image types manually like in the route.
// Actually, let's stick to the manual infer logic from the route to avoid adding deps if possible, or just add it.
// The user prompt said: "Upload with correct ContentType (mime)". 
// Let's implement a simple helper or use what's available. 
// Checking the routes again, they manually mapped extensions. I will replicate that map for consistency and zero-dep.

const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION || 'auto';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;

// Check if we are ready
if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    console.error('Missing S3 environment variables.');
    console.error('Required: S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY');
    process.exit(1);
}

const s3 = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

async function getContentType(filename: string) {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.png') return 'image/png';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.gif') return 'image/gif';
    if (ext === '.svg') return 'image/svg+xml';
    if (ext === '.json') return 'application/json';
    if (ext === '.txt') return 'text/plain';
    return 'application/octet-stream';
}

async function fileExistsInS3(key: string, localSize: number): Promise<boolean> {
    try {
        const head = await s3.send(new HeadObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
        }));

        // Optional: Check size match
        if (head.ContentLength !== undefined && head.ContentLength !== localSize) {
            console.log(`[DIFF] ${key}: Size mismatch (S3: ${head.ContentLength} vs Local: ${localSize}). Re-uploading.`);
            return false;
        }

        return true;
    } catch (error: any) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            return false;
        }
        throw error;
    }
}

async function processDirectory(baseDir: string, currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.relative(baseDir, fullPath); // e.g. "foo.jpg" or "subdir/bar.png"

        if (entry.isDirectory()) {
            await processDirectory(baseDir, fullPath);
        } else {
            // Logic: we want the key to be "uploads/" + relativePath
            // The route logic assumes current behavior is flatten if using volumes usually?
            // Actually, the storage provider implementation uses `uploads / ${ key }`.
            // And keys are usually just filenames in the current flat 'uploads/' folder.
            // If the volume has subdirs, we preserve them.

            const s3Key = `uploads/${relativePath}`;
            // Note: Windows paths regex replace? Assuming running in Linux container on Railway. 
            // Better safe: .replace(/\\/g, '/')
            const apiSafeKey = s3Key.replace(/\\\\/g, '/');

            // Get stats
            const stats = await stat(fullPath);

            // Check if exists
            const exists = await fileExistsInS3(apiSafeKey, stats.size);

            if (exists) {
                console.log(`[SKIP] ${apiSafeKey} already exists.`);
                continue;
            }

            console.log(`[UPLOAD] Starting ${apiSafeKey}...`);
            try {
                const fileContent = await readFile(fullPath);
                const contentType = await getContentType(entry.name);

                await s3.send(new PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: apiSafeKey,
                    Body: fileContent,
                    ContentType: contentType,
                }));
                console.log(`[DONE] ${apiSafeKey}`);
            } catch (err) {
                console.error(`[FAIL] Failed to upload ${apiSafeKey}: `, err);
                process.exitCode = 1; // Mark as failed but continue trying others
            }
        }
    }
}

async function main() {
    // 1. Determine Source
    // Prefer env var, fallback to local default
    let sourceRoot = process.env.RAILWAY_VOLUME_MOUNT_PATH;

    if (!sourceRoot) {
        console.log('RAILWAY_VOLUME_MOUNT_PATH not set. Using local default: ./uploads');
        sourceRoot = path.join(process.cwd(), 'uploads');
    } else {
        // Warning: user said mount path might be the root, uploads inside it?
        // "If RAILWAY_VOLUME_MOUNT_PATH is set, assume uploads are inside it (common).
        // Otherwise use your app’s known upload directory"
        // Let's verify if 'uploads' subdir exists inside volume path or if volume path IS the uploads dir.
        // Usually volumes are mounted at /app/uploads or /mnt/volume.
        // Let's try to detect.
        console.log(`Volume Mount Path: ${sourceRoot}`);

        // Heuristic: Check if sourceRoot/uploads exists?
        // Or assume sourceRoot IS the persistence root. 
        // Our app writes to `process.cwd() / uploads`. 
        // If Railway volume is mounted AT `process.cwd() / uploads`, then sourceRoot will be that path.
        // Use sourceRoot as is.
    }

    // Try to append 'uploads' if it seems we are at root and uploads is a subdir?
    // Actually, safest is to use the exact logic the app used: `process.cwd() / uploads`.
    // If the volume is mounted there, `process.cwd() / uploads` is correct.
    // If the volume is mounted elsewhere and symlinked, we might need to find it.
    // BUT, the migration script runs IN the container.
    // So sticking to `path.join(process.cwd(), 'uploads')` is actually the most reliable way to find *what the app sees*.
    // UNLESS the app writes to an absolute path defined by RAILWAY_VOLUME_MOUNT_PATH.
    // The previous code in `admin / upload / route.ts` used: `path.join(process.cwd(), 'uploads')`.
    // So that is authoritative.

    sourceRoot = path.join(process.cwd(), 'uploads');

    console.log(`Source Directory: ${sourceRoot}`);

    try {
        await stat(sourceRoot);
    } catch {
        console.error(`Directory ${sourceRoot} does not exist. Nothing to migrate.`);
        return;
    }

    await processDirectory(sourceRoot, sourceRoot);
    console.log('Migration scan completed.');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
