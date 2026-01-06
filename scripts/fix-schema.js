const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Running schema fix script (Node.js)...')

    try {
        console.log('Checking User columns...')

        // Add User columns
        await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyDaily" BOOLEAN NOT NULL DEFAULT true;
    `)
        await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyFeatures" BOOLEAN NOT NULL DEFAULT true;
    `)
        await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyWeekly" BOOLEAN NOT NULL DEFAULT true;
    `)
        console.log('User columns checked/added.')

        // Create NotificationHistory table
        console.log('Checking NotificationHistory table...')
        await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "NotificationHistory" (
            "id" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "body" TEXT NOT NULL,
            "url" TEXT,
            "type" TEXT NOT NULL,
            "sentCount" INTEGER NOT NULL,
            "failedCount" INTEGER NOT NULL,
            "sentByUserId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "NotificationHistory_pkey" PRIMARY KEY ("id")
        );
    `)
        console.log('NotificationHistory table checked/created.')

        // Add Foreign Key safely
        console.log('Checking Foreign Key...')
        try {
            await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'NotificationHistory_sentByUserId_fkey') THEN
                    ALTER TABLE "NotificationHistory" ADD CONSTRAINT "NotificationHistory_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
                END IF;
            END $$;
        `)
            console.log('Foreign Key checked/added.')
        } catch (e) {
            console.warn('Foreign key addition warning:', e.message)
        }

        console.log('Schema fix completed successfully.')

    } catch (error) {
        console.error('Error fixing schema:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
