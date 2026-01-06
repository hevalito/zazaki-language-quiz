
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Verifying Badge Data...')

    try {
        const count = await prisma.badge.count()
        console.log(`📊 Total Badges in DB: ${count}`)

        if (count > 0) {
            const badges = await prisma.badge.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' }
            })
            console.log('📋 First 5 Badges found:')
            console.log(JSON.stringify(badges, null, 2))
        } else {
            console.log('⚠️ No badges found in the database table.')
        }
    } catch (error) {
        console.error('❌ Error connecting to DB or fetching badges:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
