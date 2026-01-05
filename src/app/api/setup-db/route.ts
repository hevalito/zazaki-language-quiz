import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PrismaClient, ScriptType, Level, QuestionType } from '@prisma/client'

export async function POST() {
  try {
    console.log('🚀 Starting database setup...')

    // Test connection first
    await prisma.$connect()
    console.log('✅ Database connected')

    // Push schema (this is equivalent to db:push)
    console.log('📋 Schema should already be applied by Prisma migrations')

    // Check if data already exists
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
      return NextResponse.json({
        status: 'already_setup',
        message: 'Database already contains data',
        data: {
          users: existingUsers,
          courses: await prisma.course.count(),
          questions: await prisma.question.count(),
        }
      })
    }

    // Seed the database
    console.log('🌱 Seeding database...')

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
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
          en: 'Zazakî Basics',
          de: 'Zazakî Grundlagen',
          ku: 'Zazakîya Bingehîn'
        },
        description: {
          en: 'Learn the fundamentals of Zazakî language',
          de: 'Lerne die Grundlagen der Zazakî-Sprache',
          ku: 'Bingehên zimanê Zazakî fêr bibe'
        },
        dialectCode: 'zazaki-tr',
        level: Level.A1,
        isPublished: true,
        order: 1,
      },
    })

    // Create chapter
    const chapter = await prisma.chapter.create({
      data: {
        title: {
          en: 'Greetings and Basic Phrases',
          de: 'Begrüßungen und Grundphrasen',
          ku: 'Silav û gotinên bingehîn'
        },
        description: {
          en: 'Learn common greetings and basic phrases in Zazakî',
          de: 'Lerne häufige Begrüßungen und Grundphrasen auf Zazakî',
          ku: 'Silavên gelemperî û gotinên bingehîn ên Zazakî fêr bibe'
        },
        courseId: course.id,
        order: 1,
        isPublished: true,
      },
    })

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: {
          en: 'Basic Greetings',
          de: 'Grundlegende Begrüßungen',
          ku: 'Silavên bingehîn'
        },
        description: {
          en: 'Learn how to greet people in Zazakî',
          de: 'Lerne, wie man Menschen auf Zazakî begrüßt',
          ku: 'Fêr bibe ka çawa kesan bi Zazakî silav bikî'
        },
        chapterId: chapter.id,
        order: 1,
        isPublished: true,
        targetSkills: ['vocabulary', 'pronunciation'],
      },
    })

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: {
          en: 'Greetings Quiz',
          de: 'Begrüßungs-Quiz',
          ku: 'Pirtûka silavan'
        },
        description: {
          en: 'Test your knowledge of Zazakî greetings',
          de: 'Teste dein Wissen über Zazakî-Begrüßungen',
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

    // Create sample questions with choices
    const questions = [
      {
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: {
          en: 'How do you say "Hello" in Zazakî?',
          de: 'Wie sagt man "Hallo" auf Zazakî?',
          ku: 'Bi Zazakî "Silav" çawa tê gotin?'
        },
        dialectCode: 'zazaki-tr',
        script: ScriptType.LATIN,
        difficulty: 1,
        points: 10,
        quizId: quiz.id,
        settings: { shuffleChoices: true },
        explanation: {
          en: '"Merheba" is the most common way to say hello in Zazakî.',
          de: '"Merheba" ist die häufigste Art, Hallo auf Zazakî zu sagen.',
          ku: '"Merheba" rêya herî gelemperî ya gotina silavê bi Zazakî ye.'
        },
        choices: [
          { label: { en: 'Merheba', de: 'Merheba', ku: 'Merheba' }, isCorrect: true, order: 1 },
          { label: { en: 'Sipas', de: 'Sipas', ku: 'Sipas' }, isCorrect: false, order: 2 },
          { label: { en: 'Xatir', de: 'Xatir', ku: 'Xatir' }, isCorrect: false, order: 3 },
          { label: { en: 'Roja baş', de: 'Roja baş', ku: 'Roja baş' }, isCorrect: false, order: 4 }
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
        settings: { shuffleChoices: true },
        explanation: {
          en: '"Sipas" means "Thank you" in Zazakî.',
          de: '"Sipas" bedeutet "Danke" auf Zazakî.',
          ku: '"Sipas" bi Zazakî "Spas" tê wateya.'
        },
        choices: [
          { label: { en: 'Thank you', de: 'Danke', ku: 'Spas' }, isCorrect: true, order: 1 },
          { label: { en: 'Hello', de: 'Hallo', ku: 'Silav' }, isCorrect: false, order: 2 },
          { label: { en: 'Goodbye', de: 'Auf Wiedersehen', ku: 'Xatir' }, isCorrect: false, order: 3 },
          { label: { en: 'Good morning', de: 'Guten Morgen', ku: 'Sibehî baş' }, isCorrect: false, order: 4 }
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
    }

    // Create tags
    await prisma.tag.createMany({
      data: [
        { name: 'vocabulary', description: 'Vocabulary learning questions', color: '#3B82F6' },
        { name: 'greetings', description: 'Greeting phrases and expressions', color: '#10B981' }
      ]
    })

    // Create badges
    await prisma.badge.createMany({
      data: [
        {
          code: 'first_step',
          title: { en: 'First Step', de: 'Erster Schritt', ku: 'Gavê yekem' },
          description: { en: 'Complete your first lesson', de: 'Schließe deine erste Lektion ab', ku: 'Dersê xwe yê yekem temam bike' },
          criteria: { type: 'lesson_completion', count: 1 },
          isActive: true,
        },
        {
          code: 'streak_3',
          title: { en: '3-Day Streak', de: '3-Tage-Serie', ku: '3-rojî berdewam' },
          description: { en: 'Learn for 3 consecutive days', de: 'Lerne 3 aufeinanderfolgende Tage', ku: '3 rojên li pey hev fêr bibe' },
          criteria: { type: 'streak', count: 3 },
          isActive: true,
        }
      ]
    })

    // Get final counts
    const finalCounts = {
      users: await prisma.user.count(),
      courses: await prisma.course.count(),
      questions: await prisma.question.count(),
    }

    console.log('✅ Database setup complete!')

    return NextResponse.json({
      status: 'success',
      message: 'Database setup completed successfully!',
      data: finalCounts,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ Database setup failed:', error)

    return NextResponse.json({
      status: 'error',
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
