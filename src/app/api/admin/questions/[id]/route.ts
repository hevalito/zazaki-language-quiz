import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const isAdmin = await requireAdmin()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        // Transaction to update question and replace choices
        const question = await prisma.$transaction(async (tx) => {
            // Update question fields
            const updatedQuestion = await tx.question.update({
                where: { id: params.id },
                data: {
                    prompt: data.prompt,
                    points: data.points,
                    type: data.type,
                    difficulty: data.difficulty
                }
            })

            // Delete existing choices
            await tx.choice.deleteMany({
                where: { questionId: params.id }
            })

            // Create new choices
            if (data.choices && data.choices.length > 0) {
                await tx.choice.createMany({
                    data: data.choices.map((choice: any, index: number) => ({
                        questionId: params.id,
                        label: choice.label,
                        isCorrect: choice.isCorrect,
                        order: index
                    }))
                })
            }

            return updatedQuestion
        })

        return NextResponse.json(question)
    } catch (error) {
        console.error('Error updating question:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

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

        await prisma.question.delete({
            where: {
                id: params.id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting question:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
