
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'heval@me.com'
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log(`User ${email} not found.`)
    } else {
        console.log(`User: ${user.email}`)
        console.log(`Admin Status: ${user.isAdmin}`)
        console.log(`ID: ${user.id}`)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
