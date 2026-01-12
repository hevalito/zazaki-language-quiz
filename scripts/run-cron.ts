import { PrismaClient } from '@prisma/client'
import { generateDailyQuiz } from '@/lib/daily-quiz'
import { startOfDay, subDays } from 'date-fns'
import webPush from 'web-push'

const prisma = new PrismaClient()

// --- Shared Helpers (Duplicated to avoid Next.js dependency in script) ---
async function shouldRunCron(type: string): Promise<boolean> {
    const globalEnabled = await prisma.systemSetting.findUnique({ where: { key: 'push_global_enabled' } })
    if (globalEnabled && globalEnabled.value === false) return false

    const specificEnabled = await prisma.systemSetting.findUnique({ where: { key: `push_${type}_enabled` } })
    if (!specificEnabled || specificEnabled.value === false) return false

    return true
}

async function getNotificationTemplate(type: string, defaultTemplate: string): Promise<string> {
    const setting = await prisma.systemSetting.findUnique({ where: { key: `push_template_${type}` } })
    if (setting?.value && typeof setting.value === 'string') return setting.value
    return defaultTemplate
}

function replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{${key}}`, 'g'), String(value))
    }
    return result
}

let _systemUserId: string | null = null
async function getSystemUserId() {
    if (_systemUserId) return _systemUserId

    const email = 'system@zazaki-game.com'
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
        _systemUserId = existing.id
        return existing.id
    }

    // Create system user if missing
    const newUser = await prisma.user.create({
        data: {
            email,
            name: 'System',
            nickname: 'Zazaki Bot',
            isAdmin: true,
            preferredScript: 'LATIN',
            dailyGoal: 0,
            totalXP: 0,
        }
    })
    _systemUserId = newUser.id
    return newUser.id
}

async function sendPush(subscriptions: any[], title: string, body: string, url: string = '/', type: string) {
    const publicVapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateVapid = process.env.VAPID_PRIVATE_KEY

    if (!publicVapid || !privateVapid) {
        console.error('VAPID keys missing:')
        if (!publicVapid) console.error('- Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY')
        if (!privateVapid) console.error('- Missing VAPID_PRIVATE_KEY')
        return
    }

    // Configure VAPID once
    try {
        webPush.setVapidDetails(
            process.env.VAPID_SUBJECT || 'mailto:admin@zazaki.com',
            publicVapid,
            privateVapid
        )
    } catch (err) {
        console.error('Error setting VAPID details:', err)
        return
    }

    const payload = JSON.stringify({
        title,
        body,
        url,
        actions: [{ action: 'open', title: 'Start' }]
    })

    let success = 0
    let failed = 0

    await Promise.all(subscriptions.map(sub =>
        webPush.sendNotification({
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
        }, payload)
            .then(() => success++)
            .catch(async (err: any) => {
                failed++
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await prisma.pushSubscription.delete({ where: { id: sub.id } })
                }
            })
    ))

    if (success > 0 || failed > 0) {
        console.log(`Sent ${success} notifications (${failed} failed).`)
    }

    try {
        const sentByUserId = await getSystemUserId()
        await prisma.notificationHistory.create({
            data: {
                title,
                body,
                url,
                type,
                sentCount: success,
                failedCount: failed,
                sentByUserId
            }
        })
    } catch (e) {
        console.error('Failed to log notification history:', e)
    }
}

// --- Jobs ---

async function runDailyChallenge() {
    console.log('Running Daily Challenge Job...')

    // 1. Generate Quiz (Idempotent-ish)
    // The library function generateDailyQuiz checks if one exists for today
    try {
        const result = await generateDailyQuiz()
        console.log('Daily Quiz Generation:', result.message || 'Success')
    } catch (e) {
        console.error('Error generating quiz:', e)
    }

    // 2. Send Push
    if (!await shouldRunCron('daily_challenge')) {
        console.log('Daily Challenge push disabled.')
        return
    }

    // Check if we already sent this today? 
    // Ideally user notifications table stores this, but for now we rely on the 8am window.
    // Optimization: Just send to everyone.
    const subs = await prisma.pushSubscription.findMany({
        where: { user: { notifyDaily: true } },
        include: { user: true }
    })

    if (subs.length === 0) return

    const template = await getNotificationTemplate('daily_challenge', 'Heute wartet eine neue Challenge auf dich! 🚀')

    // Group by user for variables
    // Simple blast for now to save script complexity/execution time? 
    // No, variables are requested.
    for (const sub of subs) {
        const name = sub.user.nickname || sub.user.name || 'Champion'
        const msg = replaceVariables(template, { username: name })

        // Extract Title/Body
        const [title, ...bodyParts] = msg.includes('\n') ? msg.split('\n') : ['Neues Quiz!', msg]
        const body = bodyParts.join('\n') || msg

        await sendPush([sub], title, body, '/daily', 'DAILY_CHALLENGE')
    }
}

async function runStreakSaver() {
    console.log('Running Streak Saver Job...')
    if (!await shouldRunCron('streak_saver')) {
        console.log('Streak Saver disabled.')
        return
    }

    const todayStart = startOfDay(new Date())
    const atRiskUsers = await prisma.user.findMany({
        where: {
            notifyDaily: true,
            streak: { gt: 0 },
            OR: [
                { lastActiveDate: { lt: todayStart } },
                { lastActiveDate: null }
            ],
            pushSubscriptions: { some: {} }
        },
        include: { pushSubscriptions: true }
    })

    if (atRiskUsers.length === 0) {
        console.log('No at-risk users.')
        return
    }

    const template = await getNotificationTemplate('streak_saver', 'Achtung! Dein {streak}-Tage Streak ist in Gefahr! 😱')

    for (const user of atRiskUsers) {
        const name = user.nickname || user.name || 'Champion'
        const msg = replaceVariables(template, { username: name, streak: user.streak })
        const [title, ...bodyParts] = msg.includes('\n') ? msg.split('\n') : ['Achtung!', msg]
        const body = bodyParts.join('\n') || msg

        await sendPush(user.pushSubscriptions, title, body, '/daily', 'STREAK_SAVER')
    }
}

async function runInactivityRescue() {
    console.log('Running Inactivity Rescue Job...')
    if (!await shouldRunCron('inactivity')) {
        console.log('Inactivity Rescue disabled.')
        return
    }

    const now = new Date()
    const threeDaysAgo = subDays(now, 3)
    const fourDaysAgo = subDays(now, 4)

    const inactiveUsers = await prisma.user.findMany({
        where: {
            notifyWeekly: true,
            lastActiveDate: {
                lt: threeDaysAgo,
                gt: fourDaysAgo
            },
            pushSubscriptions: { some: {} }
        },
        include: { pushSubscriptions: true }
    })

    if (inactiveUsers.length === 0) {
        console.log('No inactive users in target window.')
        return
    }

    const template = await getNotificationTemplate('inactivity', 'Wir vermissen dich! Komm zurück und lerne weiter. 👋')

    for (const user of inactiveUsers) {
        const name = user.nickname || user.name || 'Champion'
        const days = 3 // approx
        const msg = replaceVariables(template, { username: name, days_inactive: days })
        const [title, ...bodyParts] = msg.includes('\n') ? msg.split('\n') : ['Wir vermissen dich!', msg]
        const body = bodyParts.join('\n') || msg

        await sendPush(user.pushSubscriptions, title, body, '/', 'INACTIVITY_RESCUE')
    }
}

async function main() {
    const now = new Date()
    const hour = now.getUTCHours()

    console.log(`Cron Runner started at ${now.toISOString()} (Hour: ${hour} UTC)`)

    // Schedule
    // 08:00 - 09:00 UTC: Daily Challenge
    if (hour === 8) {
        await runDailyChallenge()
    }

    // 10:00 - 11:00 UTC: Inactivity Rescue
    if (hour === 10) {
        await runInactivityRescue()
    }

    // 18:00 - 19:00 UTC: Streak Saver
    if (hour === 18) {
        await runStreakSaver()
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
