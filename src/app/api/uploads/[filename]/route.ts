import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { getStorage } from '@/lib/storage'
import { Readable } from 'stream'

// Helper to convert Node.js Readable stream to Web ReadableStream
function nodeToWebStream(nodeStream: Readable): ReadableStream {
    return new ReadableStream({
        start(controller) {
            nodeStream.on('data', (chunk) => controller.enqueue(chunk))
            nodeStream.on('end', () => controller.close())
            nodeStream.on('error', (err) => controller.error(err))
        },
        cancel() {
            nodeStream.destroy()
        },
    })
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params

        // Security check: Prevent directory traversal (though storage abstraction should handle this too)
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return new NextResponse('Invalid filename', { status: 400 })
        }

        const fileData = await getStorage().get(filename)

        if (!fileData) {
            return new NextResponse('File not found', { status: 404 })
        }

        // Determine content type based on extension
        const ext = path.extname(filename).toLowerCase()
        let contentType = 'application/octet-stream'
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
        if (ext === '.png') contentType = 'image/png'
        if (ext === '.webp') contentType = 'image/webp'
        if (ext === '.gif') contentType = 'image/gif'

        let responseBody: BodyInit
        if (fileData instanceof Buffer) {
            responseBody = fileData as unknown as BodyInit
        } else if (fileData instanceof Readable) {
            responseBody = nodeToWebStream(fileData) as unknown as BodyInit
        } else {
            // It's already a ReadableStream (from AWS SDK)
            responseBody = fileData as unknown as BodyInit
        }

        return new NextResponse(responseBody, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        console.error('Error serving file:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
