
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'heval@me.com'

    console.log(`Looking for user ${email}...`)

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        console.error(`User ${email} not found!`)
        process.exit(1)
    }

    console.log(`Found user ${user.name} (${user.id}). Updating to admin...`)

    await prisma.user.update({
        where: { email },
        data: { isAdmin: true },
    })

    console.log(`Successfully made ${email} an admin! 🎉`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
