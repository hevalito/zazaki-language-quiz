import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getStorage } from '@/lib/storage'

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Admin
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // 2. Parse File
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return new NextResponse('No file uploaded', { status: 400 })
        }

        // 3. Validate
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!validTypes.includes(file.type)) {
            return new NextResponse('Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.', { status: 400 })
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            return new NextResponse('File size too large. Max 5MB.', { status: 400 })
        }

        // 4. Save File via Storage Provider
        const buffer = Buffer.from(await file.arrayBuffer())
        const timestamp = Date.now()
        let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) ext = 'jpg'

        const filename = `admin-upload-${timestamp}.${ext}`

        // This returns the public URL path
        const publicUrl = await getStorage().upload(buffer, filename, file.type)

        return NextResponse.json({ url: publicUrl })

    } catch (error) {
        console.error('Admin upload error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
