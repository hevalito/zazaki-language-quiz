import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { writeFile } from 'fs/promises'

export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return new NextResponse('No file uploaded', { status: 400 })
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!validTypes.includes(file.type)) {
            return new NextResponse('Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.', { status: 400 })
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            return new NextResponse('File size too large. Max 5MB.', { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'uploads')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        // Generate safe unique filename
        const timestamp = Date.now()
        // clean extension
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'

        const filename = `avatar-${session.user.id}-${timestamp}.${safeExt}`
        const filePath = path.join(uploadDir, filename)

        // Write file to disk
        await writeFile(filePath, buffer)

        // Construct public URL
        // We assume the app is hosted at root, so relative path works
        const publicUrl = `/api/uploads/${filename}`

        // Update user profile
        await prisma.user.update({
            where: { id: session.user.id },
            data: { image: publicUrl }
        })

        return NextResponse.json({ url: publicUrl })

    } catch (error) {
        console.error('Error uploading avatar:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
