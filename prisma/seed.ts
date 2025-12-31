import { PrismaClient, ScriptType, Level, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@zazaki-game.com' },
    update: {},
    create: {
      email: 'admin@zazaki-game.com',
      name: 'Admin User',
      preferredScript: ScriptType.LATIN,
      dailyGoal: 50,
      streak: 0,
      totalXP: 0,
      currentLevel: Level.C2,
      isAdmin: true,
    },
  })

  console.log('👤 Created admin user:', adminUser.email)

  // Create sample course
  const course = await prisma.course.create({
    data: {
      title: {
        en: 'Zazaki Basics',
        de: 'Zazaki Grundlagen',
        ku: 'Zazakiya Bingehîn'
      },
      description: {
        en: 'Learn the fundamentals of Zazaki language',
        de: 'Lerne die Grundlagen der Zazaki-Sprache',
        ku: 'Bingehên zimanê Zazakî fêr bibe'
      },
      dialectCode: 'zazaki-tr',
      level: Level.A1,
      isPublished: true,
      order: 1,
    },
  })

  console.log('📚 Created course:', course.title)

  // Create chapter
  const chapter = await prisma.chapter.create({
    data: {
      title: {
        en: 'Greetings and Basic Phrases',
        de: 'Begrüßungen und Grundphrasen',
        ku: 'Silav û gotinên bingehîn'
      },
      description: {
        en: 'Learn common greetings and basic phrases in Zazaki',
        de: 'Lerne häufige Begrüßungen und Grundphrasen auf Zazaki',
        ku: 'Silavên gelemperî û gotinên bingehîn ên Zazakî fêr bibe'
      },
      courseId: course.id,
      order: 1,
      isPublished: true,
    },
  })

  console.log('📖 Created chapter:', chapter.title)

  // Create lesson
  const lesson = await prisma.lesson.create({
    data: {
      title: {
        en: 'Basic Greetings',
        de: 'Grundlegende Begrüßungen',
        ku: 'Silavên bingehîn'
      },
      description: {
        en: 'Learn how to greet people in Zazaki',
        de: 'Lerne, wie man Menschen auf Zazaki begrüßt',
        ku: 'Fêr bibe ka çawa kesan bi Zazakî silav bikî'
      },
      chapterId: chapter.id,
      order: 1,
      isPublished: true,
      targetSkills: ['vocabulary', 'pronunciation'],
    },
  })

  console.log('📝 Created lesson:', lesson.title)

  // Create quiz
  const quiz = await prisma.quiz.create({
    data: {
      title: {
        en: 'Greetings Quiz',
        de: 'Begrüßungs-Quiz',
        ku: 'Pirtûka silavan'
      },
      description: {
        en: 'Test your knowledge of Zazaki greetings',
        de: 'Teste dein Wissen über Zazaki-Begrüßungen',
        ku: 'Zanîna xwe ya silavên Zazakî biceribîne'
      },
      lessonId: lesson.id,
      order: 1,
      isPublished: true,
      config: {
        timeLimit: 300,
        passingScore: 70,
        randomizeQuestions: true
      },
    },
  })

  console.log('🎯 Created quiz:', quiz.title)

  // Create sample questions
  const questions = [
    {
      type: QuestionType.MULTIPLE_CHOICE,
      prompt: {
        en: 'How do you say "Hello" in Zazaki?',
        de: 'Wie sagt man "Hallo" auf Zazaki?',
        ku: 'Bi Zazakî "Silav" çawa tê gotin?'
      },
      dialectCode: 'zazaki-tr',
      script: ScriptType.LATIN,
      difficulty: 1,
      points: 10,
      quizId: quiz.id,
      settings: {
        shuffleChoices: true
      },
      explanation: {
        en: '"Merheba" is the most common way to say hello in Zazaki.',
        de: '"Merheba" ist die häufigste Art, Hallo auf Zazaki zu sagen.',
        ku: '"Merheba" rêya herî gelemperî ya gotina silavê bi Zazakî ye.'
      },
      choices: [
        {
          label: { en: 'Merheba', de: 'Merheba', ku: 'Merheba' },
          isCorrect: true,
          order: 1
        },
        {
          label: { en: 'Sipas', de: 'Sipas', ku: 'Sipas' },
          isCorrect: false,
          order: 2
        },
        {
          label: { en: 'Xatir', de: 'Xatir', ku: 'Xatir' },
          isCorrect: false,
          order: 3
        },
        {
          label: { en: 'Roja baş', de: 'Roja baş', ku: 'Roja baş' },
          isCorrect: false,
          order: 4
        }
      ]
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      prompt: {
        en: 'What does "Sipas" mean in English?',
        de: 'Was bedeutet "Sipas" auf Deutsch?',
        ku: '"Sipas" bi Înglîzî çi tê wateya?'
      },
      dialectCode: 'zazaki-tr',
      script: ScriptType.LATIN,
      difficulty: 1,
      points: 10,
      quizId: quiz.id,
      settings: {
        shuffleChoices: true
      },
      explanation: {
        en: '"Sipas" means "Thank you" in Zazaki.',
        de: '"Sipas" bedeutet "Danke" auf Zazaki.',
        ku: '"Sipas" bi Zazakî "Spas" tê wateya.'
      },
      choices: [
        {
          label: { en: 'Thank you', de: 'Danke', ku: 'Spas' },
          isCorrect: true,
          order: 1
        },
        {
          label: { en: 'Hello', de: 'Hallo', ku: 'Silav' },
          isCorrect: false,
          order: 2
        },
        {
          label: { en: 'Goodbye', de: 'Auf Wiedersehen', ku: 'Xatir' },
          isCorrect: false,
          order: 3
        },
        {
          label: { en: 'Good morning', de: 'Guten Morgen', ku: 'Sibehî baş' },
          isCorrect: false,
          order: 4
        }
      ]
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      prompt: {
        en: 'How do you say "Good night" in Zazaki?',
        de: 'Wie sagt man "Gute Nacht" auf Zazaki?',
        ku: 'Bi Zazakî "Şeva baş" çawa tê gotin?'
      },
      dialectCode: 'zazaki-tr',
      script: ScriptType.LATIN,
      difficulty: 2,
      points: 15,
      quizId: quiz.id,
      settings: {
        shuffleChoices: true
      },
      explanation: {
        en: '"Şeva baş" is how you say good night in Zazaki.',
        de: '"Şeva baş" ist, wie man gute Nacht auf Zazaki sagt.',
        ku: '"Şeva baş" bi Zazakî şeva baş tê gotin.'
      },
      choices: [
        {
          label: { en: 'Şeva baş', de: 'Şeva baş', ku: 'Şeva baş' },
          isCorrect: true,
          order: 1
        },
        {
          label: { en: 'Roja baş', de: 'Roja baş', ku: 'Roja baş' },
          isCorrect: false,
          order: 2
        },
        {
          label: { en: 'Sibehî baş', de: 'Sibehî baş', ku: 'Sibehî baş' },
          isCorrect: false,
          order: 3
        },
        {
          label: { en: 'Êvarî baş', de: 'Êvarî baş', ku: 'Êvarî baş' },
          isCorrect: false,
          order: 4
        }
      ]
    }
  ]

  // Create questions with choices
  for (const questionData of questions) {
    const { choices, ...questionWithoutChoices } = questionData

    const question = await prisma.question.create({
      data: questionWithoutChoices,
    })

    // Create choices for the question
    for (const choiceData of choices) {
      await prisma.choice.create({
        data: {
          ...choiceData,
          questionId: question.id,
        },
      })
    }

    console.log('❓ Created question:', question.prompt)
  }

  // Create some tags
  const vocabularyTag = await prisma.tag.create({
    data: {
      name: 'vocabulary',
      description: 'Vocabulary learning questions',
      color: '#3B82F6',
    },
  })

  const greetingsTag = await prisma.tag.create({
    data: {
      name: 'greetings',
      description: 'Greeting phrases and expressions',
      color: '#10B981',
    },
  })

  console.log('🏷️ Created tags')

  // Create some badges
  const firstStepBadge = await prisma.badge.create({
    data: {
      code: 'first_step',
      title: {
        en: 'First Step',
        de: 'Erster Schritt',
        ku: 'Gavê yekem'
      },
      description: {
        en: 'Complete your first lesson',
        de: 'Schließe deine erste Lektion ab',
        ku: 'Dersê xwe yê yekem temam bike'
      },
      criteria: {
        type: 'lesson_completion',
        count: 1
      },
      isActive: true,
    },
  })

  const streakBadge = await prisma.badge.create({
    data: {
      code: 'streak_3',
      title: {
        en: '3-Day Streak',
        de: '3-Tage-Serie',
        ku: '3-rojî berdewam'
      },
      description: {
        en: 'Learn for 3 consecutive days',
        de: 'Lerne 3 aufeinanderfolgende Tage',
        ku: '3 rojên li pey hev fêr bibe'
      },
      criteria: {
        type: 'streak',
        count: 3
      },
      isActive: true,
    },
  })

  console.log('🏆 Created badges')

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
