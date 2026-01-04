import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15, params is a Promise
) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Check if current user is admin
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!currentUser?.isAdmin) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const { id } = await params
        const body = await req.json()
        const { isAdmin, nickname, name } = body

        // Prevent removing admin from oneself to avoid locking out
        if (id === currentUser.id && isAdmin === false) {
            return new NextResponse("Cannot remove own admin status", { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                isAdmin,
                nickname,
                name
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('[ADMIN_USER_PATCH]', error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!currentUser?.isAdmin) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const { id } = await params

        if (id === currentUser.id) {
            return new NextResponse("Cannot delete own account", { status: 400 })
        }

        await prisma.user.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[ADMIN_USER_DELETE]', error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
