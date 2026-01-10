
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { Readable } from 'stream'

interface StorageProvider {
    upload(file: Buffer | Uint8Array, key: string, contentType: string): Promise<string>
    get(key: string): Promise<ReadableStream | Buffer | null>
    exists(key: string): Promise<boolean>
}

// Env vars
const S3_ENDPOINT = process.env.S3_ENDPOINT
const S3_BUCKET = process.env.S3_BUCKET
const S3_REGION = process.env.S3_REGION || 'auto'
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY

const USE_S3 = !!(S3_ENDPOINT && S3_BUCKET && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY)

class VolumeStorage implements StorageProvider {
    private uploadDir: string

    constructor() {
        this.uploadDir = path.join(process.cwd(), 'uploads')
    }

    async upload(file: Buffer | Uint8Array, filename: string, contentType: string): Promise<string> {
        // Filename comes in as "uploads/filename.ext" often, but our local volume is likely just the filename in the dir
        // We need to handle the fact that key might be "uploads/foo.jpg" but we want to store it in process.cwd()/uploads/foo.jpg

        const cleanFilename = path.basename(filename)
        const filePath = path.join(this.uploadDir, cleanFilename)

        if (!fs.existsSync(this.uploadDir)) {
            await mkdir(this.uploadDir, { recursive: true })
        }

        await writeFile(filePath, file)

        // Return public URL path
        return `/api/uploads/${cleanFilename}`
    }

    async get(filename: string): Promise<ReadableStream | Buffer | null> {
        // Handle potential "uploads/" prefix if passed as key
        const cleanFilename = path.basename(filename)
        const filePath = path.join(this.uploadDir, cleanFilename)

        if (!fs.existsSync(filePath)) return null

        // Returning Buffer for simplicity with FS, though Stream is better for large files. 
        // fs.readFileSync is what was used before.
        return fs.readFileSync(filePath)
    }

    async exists(filename: string): Promise<boolean> {
        const cleanFilename = path.basename(filename)
        const filePath = path.join(this.uploadDir, cleanFilename)
        return fs.existsSync(filePath)
    }
}

class S3Storage implements StorageProvider {
    private client: S3Client
    private bucket: string
    private fallback: VolumeStorage

    constructor() {
        this.client = new S3Client({
            endpoint: S3_ENDPOINT,
            region: S3_REGION,
            credentials: {
                accessKeyId: S3_ACCESS_KEY_ID!,
                secretAccessKey: S3_SECRET_ACCESS_KEY!
            },
            forcePathStyle: true // Often needed for compatible providers
        })
        this.bucket = S3_BUCKET!
        this.fallback = new VolumeStorage()
    }

    async upload(file: Buffer | Uint8Array, key: string, contentType: string): Promise<string> {
        // Start using structured keys if not already? The plan says "uploads/filename"
        // If the key is just a filename, assume we want it in 'uploads/' prefix to match current structure logic if we were to treat bucket as root.
        // However, the prompt says "Store only the object key in DB (e.g. uploads/user/abc.png)". 
        // Current app stores full URL or filename. 
        // The admin upload route stores `filename` locally and returns ` / api / uploads / filename`.

        // Let's standardise on the key being `uploads / ${ filename } ` in the bucket.
        const objectKey = key.startsWith('uploads/') ? key : `uploads/${key}`

        await this.client.send(new PutObjectCommand({
            Bucket: this.bucket,
            Key: objectKey,
            Body: file,
            ContentType: contentType,
            // ACL: 'public-read' // buckets are private usually
        }))

        // Return the proxy URL that matches the old behavior
        // The key is uploads/foo.jpg -> we want /api/uploads/foo.jpg
        const filename = path.basename(key)
        return `/api/uploads/${filename}`
    }

    async get(key: string): Promise<ReadableStream | Buffer | null> {
        const objectKey = key.startsWith('uploads/') ? key : `uploads/${key}`

        try {
            // Try S3 first
            const response = await this.client.send(new GetObjectCommand({
                Bucket: this.bucket,
                Key: objectKey
            }))

            if (response.Body) {
                // Convert web stream to readable stream if needed, or return as is.
                // AWS SDK v3 returns a stream.
                return response.Body as unknown as ReadableStream
            }
        } catch (e: any) {
            if (e.name !== 'NoSuchKey' && e.name !== 'NotFound') {
                console.error('S3 Get Error:', e)
            }
            // Fallback to volume if not found (during migration)
            console.log(`S3 miss for ${objectKey}, checking fallback...`)
            return this.fallback.get(key)
        }
        return null
    }

    async exists(key: string): Promise<boolean> {
        const objectKey = key.startsWith('uploads/') ? key : `uploads/${key}`
        try {
            await this.client.send(new HeadObjectCommand({
                Bucket: this.bucket,
                Key: objectKey
            }))
            return true
        } catch {
            return false
        }
    }
}

// Singleton instance
let storageInstance: StorageProvider

export function getStorage(): StorageProvider {
    if (storageInstance) return storageInstance

    if (USE_S3) {
        console.log('Using S3 Storage')
        storageInstance = new S3Storage()
    } else {
        console.log('Using Volume Storage (Legacy)')
        storageInstance = new VolumeStorage()
    }
    return storageInstance
}
