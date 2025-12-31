
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Randomized vocabulary list embedded directly
const vocabulary = [
  {
    "zazaki": "sür kerdene",
    "variant": "sur kerdene",
    "pos": "verb",
    "gender": "",
    "standard": "sûr kerdene",
    "german": "anbraten, braten, frittieren"
  },
  {
    "zazaki": "emso",
    "variant": "esmo",
    "pos": "adv",
    "gender": "",
    "standard": "emşo",
    "german": "heute Abend"
  },
  {
    "zazaki": "heşt",
    "variant": "",
    "pos": "zahl",
    "gender": "",
    "standard": "",
    "german": "acht"
  },
  {
    "zazaki": "di-hîrê",
    "variant": "",
    "pos": "adv",
    "gender": "",
    "standard": "",
    "german": "ein paar"
  },
  {
    "zazaki": "huqûqnas",
    "variant": "",
    "pos": "nom",
    "gender": "-e",
    "standard": "",
    "german": "Jurist/in; Rechtsgelehrter/in"
  },
  {
    "zazaki": "leçege",
    "variant": "",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "Kopftuch"
  },
  {
    "zazaki": "kamera",
    "variant": "",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "Kamera"
  },
  {
    "zazaki": "paka",
    "variant": "",
    "pos": "adv",
    "gender": "",
    "standard": "",
    "german": "unbewölkt, klar (Himmel)"
  },
  {
    "zazaki": "mîyane",
    "variant": "",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "Lende, Taille, Kreuz"
  },
  {
    "zazaki": "mizin",
    "variant": "micin",
    "pos": "adj",
    "gender": "-e",
    "standard": "",
    "german": "neblig"
  },
  {
    "zazaki": "qewe",
    "variant": "",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "Kaffee"
  },
  {
    "zazaki": "makeke",
    "variant": "maykeke",
    "pos": "adj",
    "gender": "m",
    "standard": "makî",
    "german": "feminin, weiblich"
  },
  {
    "zazaki": "tewir be tewir",
    "variant": "",
    "pos": "adv",
    "gender": "",
    "standard": "",
    "german": "vielfältig, verschiedenartig, vielseitig"
  },
  {
    "zazaki": "almankî",
    "variant": "",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "Deutsch, die deutsche Sprache"
  },
  {
    "zazaki": "komare",
    "variant": "",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "Republik"
  },
  {
    "zazaki": "DYA (Dewletê Yewbîyayeyî yê Amerîka)",
    "variant": "",
    "pos": "nom",
    "gender": "zh",
    "standard": "",
    "german": "USA (Vereinigte Staaten von Amerika)"
  },
  {
    "zazaki": "miz",
    "variant": "mic",
    "pos": "nom",
    "gender": "n",
    "standard": "mij",
    "german": "Nebel"
  },
  {
    "zazaki": "tede",
    "variant": "",
    "pos": "adv",
    "gender": "",
    "standard": "",
    "german": "darin"
  },
  {
    "zazaki": "siknayene",
    "variant": "",
    "pos": "verb",
    "gender": "",
    "standard": "şiknayene",
    "german": "brechen, zerbrechen, kaputt machen"
  },
  {
    "zazaki": "bêpere",
    "variant": "",
    "pos": "adj",
    "gender": "-e",
    "standard": "",
    "german": "umsonst, gratis, kostenlos"
  },
  {
    "zazaki": "aşt",
    "variant": "haşt",
    "pos": "adj",
    "gender": "-e",
    "standard": "",
    "german": "versöhnt, vertragen"
  },
  {
    "zazaki": "hîrem",
    "variant": "",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "Webstuhl, Webgeschirr"
  },
  {
    "zazaki": "terzî",
    "variant": "",
    "pos": "nom",
    "gender": "-îye",
    "standard": "",
    "german": "Schneider/in"
  },
  {
    "zazaki": "cizdan",
    "variant": "",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "Geldbeutel, Portemonnaie"
  },
  {
    "zazaki": "silayîye",
    "variant": "",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "Einladung"
  },
  {
    "zazaki": "tanî",
    "variant": "",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "(Ausstrahlungs)Wärme"
  },
  {
    "zazaki": "sane kerdene",
    "variant": "",
    "pos": "verb",
    "gender": "",
    "standard": "şane kerdene",
    "german": "kämmen"
  },
  {
    "zazaki": "mîyanneteweyî",
    "variant": "",
    "pos": "adj",
    "gender": "-ye",
    "standard": "",
    "german": "international, zwischenstaatlich"
  },
  {
    "zazaki": "hazir",
    "variant": "",
    "pos": "adj",
    "gender": "-e",
    "standard": "",
    "german": "bereit, fertig; anwesend"
  },
  {
    "zazaki": "xalî",
    "variant": "",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "Teppich"
  },
  {
    "zazaki": "girê",
    "variant": "",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "Knoten"
  },
  {
    "zazaki": "Japonya",
    "variant": "",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "Japan"
  },
  {
    "zazaki": "her kes",
    "variant": "",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "jeder, alle, alle Mann"
  },
  {
    "zazaki": "unîversîte",
    "variant": "",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "Universität"
  },
  {
    "zazaki": "şüane",
    "variant": "şîyane, şane",
    "pos": "nom",
    "gender": "-îye",
    "standard": "şiwane",
    "german": "Hirte/Hirtin"
  },
  {
    "zazaki": "ding",
    "variant": "",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "Haltestelle, Station"
  },
  {
    "zazaki": "cemat",
    "variant": "",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "Gemeinde, Gesellschaft, Community"
  },
  {
    "zazaki": "lewe",
    "variant": "ley",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "Seite, Neben-"
  },
  {
    "zazaki": "nêke",
    "variant": "",
    "pos": "konj",
    "gender": "",
    "standard": "",
    "german": "ansonsten, sonst, andernfalls"
  },
  {
    "zazaki": "şaristan",
    "variant": "",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "Stadt"
  },
  {
    "zazaki": "virênîye",
    "variant": "verênîye",
    "pos": "nom",
    "gender": "m",
    "standard": "vernî",
    "german": "Vorne, Vorder-, Vor-"
  },
  {
    "zazaki": "naxir",
    "variant": "",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "Rinderherde"
  },
  {
    "zazaki": "xem",
    "variant": "",
    "pos": "nom",
    "gender": "n",
    "standard": "",
    "german": "Gram, Kummer, Leid"
  },
  {
    "zazaki": "qeysî",
    "variant": "",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "Aprikose"
  },
  {
    "zazaki": "tiramî",
    "variant": "",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "Glut"
  },
  {
    "zazaki": "azne kerdene",
    "variant": "",
    "pos": "verb",
    "gender": "n",
    "standard": "ajne kerdene",
    "german": "schwimmen"
  },
  {
    "zazaki": "qey",
    "variant": "",
    "pos": "frg",
    "gender": "",
    "standard": "",
    "german": "wozu, weshalb, weswegen"
  },
  {
    "zazaki": "rind",
    "variant": "",
    "pos": "adj",
    "gender": "-e",
    "standard": "",
    "german": "gut"
  },
  {
    "zazaki": "şêr kerdene",
    "variant": "sê kerdene",
    "pos": "verb",
    "gender": "",
    "standard": "seyr kerdene",
    "german": "betrachten, ansehen, anschauen"
  },
  {
    "zazaki": "Amerîka",
    "variant": "Hemilka",
    "pos": "nom",
    "gender": "m",
    "standard": "",
    "german": "Amerika"
  }
]

function getRandomDistractors(correct: any, list: any[], count: number) {
  const distractors: any[] = [];
  while (distractors.length < count) {
    const random = list[Math.floor(Math.random() * list.length)];
    if (random.zazaki !== correct.zazaki && !distractors.includes(random)) {
      distractors.push(random);
    }
  }
  return distractors;
}

// Helper to shuffle choices
function shuffle(array: any[]) {
  return array.sort(() => Math.random() - 0.5);
}

async function main() {
  console.log('Seeding dictionary content from LaTeX export...');

  // Cleanup previous dictionary imports
  const allChapters = await prisma.chapter.findMany();
  const chaptersToDelete = allChapters.filter(c => {
    const title = c.title as any;
    return (title && title.en === 'Dictionary Import') || title === 'Dictionary Import';
  });

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
              de: `Was bedeutet "${word.zazaki}"?`,
              en: `What does "${word.zazaki}" mean?`,
              ku: `Manayê "${word.zazaki}" çik o?`
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
