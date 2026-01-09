import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Repairing Activity timestamps...')

    // Fetch all activities where updatedAt is seemingly "new" activity but createdAt is old?
    // Actually, safest is to just reset updatedAt = createdAt for everything 
    // EXCEPT items that definitely just happened (which we can't easily distinguish from the migration timestamp).
    // However, since we JUST deployed the feature, it's safe to assume ALMOST everything is historical.
    // Real "Start -> Update" actions only started occurring after the deploy.
    // If we overwrite a legitimate "Update" from the last 5 minutes, it's a minor loss compared to fixing the whole history.

    // We will set updatedAt = createdAt.
    // This fixes the "1 minute ago" issue for old items.



    // Prisma updateMany doesn't support referencing other fields directly in `data` easily.
    // We might need $executeRaw or a loop. Loop is safer for small datasets, Raw is faster.
    // Let's use Raw for speed and correctness.

    const updated = await prisma.$executeRaw`UPDATE "Activity" SET "updatedAt" = "createdAt"`

    console.log(`✅ Repaired timestamps for ${updated} activities.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
