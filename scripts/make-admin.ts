
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error('Please provide an email address')
        process.exit(1)
    }

    console.log(`Making ${email} an admin...`)

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { isAdmin: true },
        })
        console.log(`Success! User ${user.email} (ID: ${user.id}) is now an admin.`)
    } catch (error) {
        console.error('Error updating user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
