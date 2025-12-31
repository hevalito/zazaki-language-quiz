
import { PrismaClient, ScriptType, Level } from '@prisma/client'

const prisma = new PrismaClient()

const email = process.argv[2] || 'heval@me.com'

async function main() {
    if (!email) {
        console.error('Please provide an email address')
        process.exit(1)
    }

    console.log(`Promoting ${email} to admin...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: { isAdmin: true },
        create: {
            email,
            name: 'Heval', // Default name
            isAdmin: true,
            preferredScript: ScriptType.LATIN,
            currentLevel: Level.A1
        }
    })

    console.log(`✅ Successfully promoted ${user.email} to Admin!`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
