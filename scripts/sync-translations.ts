
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma
const prisma = new PrismaClient();

// Recursive function to get all files in a directory
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach(function (file: string) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

async function main() {
    console.log('🔄 Starting translation sync...');

    // 1. Scan for keys in src directory
    const srcPath = path.join(process.cwd(), 'src');
    const files = getAllFiles(srcPath);

    // Regex to match t('key', 'default value')
    // Matches generic usage like t('header.welcome', 'Xêr ama')
    // Improved regex to handle potential newlines or different quote styles
    const regex = /t\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;

    const foundTranslations = new Map();

    files.forEach((file: string) => {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(file, 'utf8');
            let match;
            while ((match = regex.exec(content)) !== null) {
                const key = match[1];
                const defaultValue = match[2];

                // We assume the default value in code is German (de) based on project requirements,
                // OR we can just store it as the 'de' value if it's not present.
                // Actually, for Zazakî app, 'Xêr ama' is Zazaki. 
                // But the user requested "German base strings".
                // Let's look at the actual usage: t('header.welcome', 'Xêr ama') -> 'Xêr ama' is Zazaki.
                // t('dailyGoal.title', 'Tagesziel') -> 'Tagesziel' is German.

                // Strategy: Just Ensure the key exists. If we create it, we use the default value for 'de' (if it looks German?) 
                // or just put it in 'de' and let them change it.
                // Given the mix, we'll upsert it into the 'de' slot IF it's new.

                if (!foundTranslations.has(key)) {
                    foundTranslations.set(key, defaultValue);
                }
            }
        }
    });

    console.log(`📦 Found ${foundTranslations.size} unique keys in codebase.`);

    let newKeys = 0;
    let updatedKeys = 0;

    for (const [key, defaultValue] of foundTranslations) {
        const existing = await prisma.translation.findUnique({
            where: { key }
        });

        if (!existing) {
            // Create new
            // We'll calculate a simple heuristic or just assign to 'de' as requested base language.
            // If the default value is clearly Zazaki (e.g. 'Xêr ama'), it's slightly awkward if we label it 'de',
            // but the Admin UI allows editing.
            // For now, we will seed 'de' with this value.
            await prisma.translation.create({
                data: {
                    key,
                    values: { de: defaultValue }
                }
            });
            newKeys++;
        } else {
            // Optional: Update 'de' if it's missing in the existing values?
            // Let's be safe and NOT overwrite existing data, only add if the key was completely missing.
            // Or should we fill in missing 'de' values?
            const currentValues = existing.values || {};
            if (!currentValues['de']) {
                await prisma.translation.update({
                    where: { key },
                    data: {
                        values: { ...currentValues, de: defaultValue }
                    }
                });
                updatedKeys++;
            }
        }
    }

    console.log(`✅ Sync complete.`);
    console.log(`   - New keys created: ${newKeys}`);
    console.log(`   - Existing keys updated (missing 'de'): ${updatedKeys}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
