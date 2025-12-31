
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'heval@me.com'
    const user = await prisma.user.update({
        where: { email },
        data: { isAdmin: true }
    })

    console.log(`Updated user ${user.email} to Admin: ${user.isAdmin}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
