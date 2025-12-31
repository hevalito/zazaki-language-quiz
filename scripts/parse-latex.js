const fs = require('fs');
const path = require('path');

const latexContent = fs.readFileSync(path.join(__dirname, 'Dictionary_Kurs2024.tex'), 'utf-8');

const entries = [];
const regex = /\\entry\s*\{((?:[^{}]|\\{[^{}]*\})*)\}\s*\{((?:[^{}]|\\{[^{}]*\})*)\}\s*\{((?:[^{}]|\\{[^{}]*\})*)\}\s*\{((?:[^{}]|\\{[^{}]*\})*)\}\s*\{((?:[^{}]|\\{[^{}]*\})*)\}\s*\{((?:[^{}]|\\{[^{}]*\})*)\}/g;

function cleanLatex(text) {
  if (!text) return '';
  let cleaned = text
    .replace(/\\textsuperscript\{[^}]+\}/g, '')
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    .replace(/\\textit\{([^}]+)\}/g, '$1')
    .replace(/\\textsc\{([^}]+)\}/g, '$1')
    .replace(/\\par\\noindent/g, ' ')
    .replace(/\\rightarrow/g, '->')
    .replace(/---/g, '-')
    .replace(/\$/g, '')
    .replace(/\\bullet/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ').trim();
  return cleaned;
}

let match;
while ((match = regex.exec(latexContent)) !== null) {
  entries.push({
    zazaki: cleanLatex(match[1]),
    variant: cleanLatex(match[2]),
    pos: cleanLatex(match[3]),
    gender: cleanLatex(match[4]),
    standard: cleanLatex(match[5]),
    german: cleanLatex(match[6])
  });
}

console.log(`Parsed ${entries.length} entries.`);

const validEntries = entries.filter(e =>
  e.zazaki.length > 1 &&
  e.german.length > 1 &&
  !e.german.includes('->') &&
  !e.zazaki.includes('->')
);

console.log(`Valid entries suitable for quiz: ${validEntries.length}`);

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const shuffledEntries = shuffleArray([...validEntries]);

// Generate Seed File Content
const seedContent = `
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Randomized vocabulary list embedded directly
const vocabulary = ${JSON.stringify(shuffledEntries.slice(0, 50), null, 2)}

function getRandomDistractors(correct, list, count) {
    const distractors = [];
    while (distractors.length < count) {
        const random = list[Math.floor(Math.random() * list.length)];
        if (random.german !== correct && !distractors.includes(random.german)) {
            distractors.push(random.german);
        }
    }
    return distractors;
}

// Helper to shuffle choices
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function main() {
    console.log('Seeding dictionary content from LaTeX export...');
    
    // Cleanup previous dictionary imports
    const allChapters = await prisma.chapter.findMany();
    const chaptersToDelete = allChapters.filter(c => 
        (c.title && c.title.en === 'Dictionary Import') || 
        c.title === 'Dictionary Import' // For legacy string titles if any
    );
    
    for (const c of chaptersToDelete) {
        await prisma.chapter.delete({ where: { id: c.id } });
    }

    const course = await prisma.course.findFirst();
    if (!course) {
        console.error("No course found. Run main seed first.");
        return;
    }

    const chapter = await prisma.chapter.create({
        data: {
            title: { de: 'Wörterbuch-Import', en: 'Dictionary Import', ku: 'Importê Ferhengî' },
            order: 10,
            courseId: course.id,
            lessons: {
                create: {
                    title: { de: 'Allgemeiner Wortschatz', en: 'General Vocabulary', ku: 'Vateyê Pêroyî' },
                    order: 1,
                    description: 'Wörter aus dem Wörterbuch importiert.',
                    isPublished: true,
                    targetSkills: ['vocabulary']
                }
            }
        },
        include: { lessons: true }
    });

    const lesson = chapter.lessons[0];

    await prisma.quiz.create({
        data: {
            title: { de: 'Zufälliger Vokabeltest', en: 'Random Vocabulary Mix', ku: 'Pirsnameyê Vateyan' },
            description: { de: 'Teste deinen Wortschatz.' },
            lessonId: lesson.id,
            config: {},
            isPublished: true,
            questions: {
                create: vocabulary.map(word => {
                    const distractors = getRandomDistractors(word.german, vocabulary, 3);
                    
                    const choicesList = [
                        { label: { de: word.german, en: word.german, ku: word.german }, isCorrect: true },
                        ...distractors.map(d => ({ label: { de: d, en: d, ku: d }, isCorrect: false }))
                    ];

                    return {
                        type: 'MULTIPLE_CHOICE',
                        prompt: { 
                            de: \`Was bedeutet "\${word.zazaki}"?\`,
                            en: \`What does "\${word.zazaki}" mean?\`,
                            ku: \`Manayê "\${word.zazaki}" çik o?\`
                        },
                        dialectCode: 'dimli',
                        difficulty: 1,
                        points: 10,
                        settings: {},
                        choices: {
                            create: shuffle(choicesList)
                        }
                    };
                })
            }
        }
    });

    console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
`;

fs.writeFileSync(path.join(__dirname, '../prisma/seed-ferheng.ts'), seedContent);
console.log('Generated prisma/seed-ferheng.ts');
