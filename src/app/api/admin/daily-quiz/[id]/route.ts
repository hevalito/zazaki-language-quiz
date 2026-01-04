import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params

        // 1. Reset questions
        await prisma.question.updateMany({
            where: { quizId: id },
            data: { quizId: null }
        })

        // 2. Delete quiz
        await prisma.quiz.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete Error:', error)
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
