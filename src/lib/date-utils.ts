/**
 * Utility functions for handling Dates in Berlin Timezone (CET/CEST)
 * Standardizing on "Europe/Berlin" for all business logic.
 */

export function getBerlinDate(date: Date = new Date()): Date {
    // Returns a Date object that represents the same MOMENT, but
    // we use basic string splitting to get the "Day in Berlin".
    // Actually, simply using the locale string is safer.
    return date
}

/**
 * Returns the Start of the Day (00:00:00.000) in Berlin Time,
 * returned as a standard Date object (which will be a specific UTC timestamp).
 * 
 * Example: If Berlin is UTC+2, asking for Start of Day for "2023-10-25 14:00"
 * will return "2023-10-24 22:00:00 UTC".
 */
export function getBerlinStartOfDay(date: Date = new Date()): Date {
    const berlinDateString = date.toLocaleDateString('en-US', {
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    }) // "10/25/2023"

    // Create a date assuming the string is in UTC to easily get components, 
    // OR create it specifically for the timezone.
    // The trick: we want a timestamp that IS midnight in Berlin.
    // new Date("2023-10-25T00:00:00.000+02:00")

    // 1. Parse parts
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date)

    const year = parts.find(p => p.type === 'year')?.value
    const month = parts.find(p => p.type === 'month')?.value
    const day = parts.find(p => p.type === 'day')?.value

    // 2. Construct ISO string for Berlin Midnight
    // We cannot easily determine offset without a library like date-fns-tz.
    // However, if we construct "YYYY-MM-DD" and then ASK for the date in Berlin?

    // Workaround: Use 'sv-SE' (ISO format) to get YYYY-MM-DD
    const isoDateBerlin = date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })

    // Now we want the timestamp for `${isoDateBerlin}T00:00:00` in Europe/Berlin.
    // Since we don't have a timezone parser, we may have to iterate or guess offset?
    // No, standard JS `new Date()` parses string as Local or UTC. 

    // Simpler Hack:
    // If we assume the server is running on UTC (Railway),
    // and we want to know if a record is "Today Berlin".
    // Record.completedAt (UTC).
    // Berlin Today (YYYY-MM-DD).
    // Record.completedAt -> toBerlinString() === Berlin Today.

    // This is much simpler than finding the exact boundary Date object for Prisma "gte".
    // Prisma "gte" needs a Date object.

    // To get the Date object for Berlin Midnight:
    // 1. Create a UTC date for YYYY-MM-DD 00:00:00
    // 2. Shift it by -1 or -2 hours?
    // We don't know if it's -1 or -2 (DST).

    // Robust approach without libraries:
    // Create UTC date "YYYY-MM-DD 00:00:00Z".
    // Check its Berlin string. "YYYY-MM-DD-1 22:00" or similar.
    // Adjust until it matches "YYYY-MM-DD 00:00".

    // Optimization: Just check -1 hour (Winter) vs -2 hour (Summer).
    const targetYMD = isoDateBerlin

    // Try -2 hours (Summer)
    const trySummer = new Date(`${targetYMD}T00:00:00.000Z`)
    trySummer.setHours(trySummer.getHours() - 2)

    const checkSummer = trySummer.toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })
    if (checkSummer === targetYMD) {
        // Check if it's exactly midnight or 23:00 previous day?
        // toLocaleTimeString might help.
        const time = trySummer.toLocaleTimeString('en-US', { timeZone: 'Europe/Berlin', hour12: false })
        if (time.startsWith('00:00')) return trySummer
    }

    // Try -1 hour (Winter)
    const tryWinter = new Date(`${targetYMD}T00:00:00.000Z`)
    tryWinter.setHours(tryWinter.getHours() - 1)
    const timeWinter = tryWinter.toLocaleTimeString('en-US', { timeZone: 'Europe/Berlin', hour12: false })
    if (timeWinter.startsWith('00:00')) return tryWinter

    // Fallback (rare DST edge cases?): Return winter
    return tryWinter
}

export function getBerlinWeekStart(date: Date = new Date()): Date {
    const berlinNow = getBerlinStartOfDay(date)
    // Get day of week in Berlin
    // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    // Note: getDay() returns LOCAL (server) day of week, which might differ from Berlin Day.
    // We must check the Berlin Day index.

    const dayIndexStr = berlinNow.toLocaleDateString('en-US', { timeZone: 'Europe/Berlin', weekday: 'short' })
    // Map short string to index? "Mon" -> 1.
    // Or better: formatToParts weekday.

    // Let's rely on standard ISODay if possible, but simpler:
    // We have the Date object `berlinNow` which corresponds to 00:00 Berlin.
    // We can rely on basic JS .getDay() IF we shift it to represent "Local" time, but that's messy.

    // Approach: Iterate backwards until we hit "Mon".
    const d = new Date(berlinNow)
    // Safety break: 10 days
    for (let i = 0; i < 8; i++) {
        const str = d.toLocaleDateString('en-US', { timeZone: 'Europe/Berlin', weekday: 'short' })
        if (str === 'Mon') {
            return d
        }
        d.setDate(d.getDate() - 1)
    }
    return d
}

export function isSameBerlinDay(d1: Date, d2: Date): boolean {
    const s1 = d1.toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })
    const s2 = d2.toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })
    return s1 === s2
}
