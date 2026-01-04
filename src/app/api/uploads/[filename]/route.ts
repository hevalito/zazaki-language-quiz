import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params

        // Security check: Prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return new NextResponse('Invalid filename', { status: 400 })
        }

        const uploadDir = path.join(process.cwd(), 'uploads')
        const filePath = path.join(uploadDir, filename)

        if (!fs.existsSync(filePath)) {
            return new NextResponse('File not found', { status: 404 })
        }

        const fileBuffer = fs.readFileSync(filePath)

        // Determine content type based on extension
        const ext = path.extname(filename).toLowerCase()
        let contentType = 'application/octet-stream'
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
        if (ext === '.png') contentType = 'image/png'
        if (ext === '.webp') contentType = 'image/webp'
        if (ext === '.gif') contentType = 'image/gif'

        return new NextResponse(fileBuffer, {
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
