export type FlowNode = {
    id: string
    text: string
    description?: string // New field
    type?: 'question' | 'result' | 'info'
    image?: string
    options?: { label: string; nextId: string }[]
    result?: {
        courseId?: string
        dialect: string
        level?: string
        recommendation: string
    }
}

// For translation sync detection
// These commented out calls ensure the sync script picks up the keys and default values.
/*
t('courseFinder.n1.text', 'Was möchtest du lernen?')
t('courseFinder.n1.options.specific', 'Einen bestimmten Dialekt')
t('courseFinder.n1.options.standard', 'Standard-Zazakî')

t('courseFinder.n64.text', 'Standard-Zazakî')
t('courseFinder.n64.result.dialect', 'Standard-Zazakî')
t('courseFinder.n64.result.recommendation', 'Standard-Kurs')

t('courseFinder.n65.text', 'Standard-Kurs')
t('courseFinder.n65.result.dialect', 'Standard-Zazakî')
t('courseFinder.n65.result.recommendation', 'Standard-Kurs')

t('courseFinder.n2.text', 'Welche Region / Welcher Dialekt?')
t('courseFinder.n2.options.dersim', 'Dêrsim (Tunceli)')
t('courseFinder.n2.options.cemisgezek', 'Çemîşgezek')
t('courseFinder.n2.options.colig', 'Çolîg (Bingöl)')
t('courseFinder.n2.options.cermuge', 'Çêrmûge (Çermik)')
t('courseFinder.n2.options.erzingan', 'Erzingan (Erzincan)')
t('courseFinder.n2.options.gimgim', 'Gimgim (Varto)')
t('courseFinder.n2.options.pali', 'Pali (Palu)')
t('courseFinder.n2.options.piran', 'Pîran (Dicle)')
t('courseFinder.n2.options.sewregi', 'Sewrêgi (Siverek)')
t('courseFinder.n2.options.xarpet', 'Xarpêt (Elazığ)')
t('courseFinder.n2.options.xinus', 'Xinûs (Hınıs)')
t('courseFinder.n2.options.unknown', 'Ich weiß nicht / Ort ist nicht dabei')
t('courseFinder.n2.options.notNative', 'Ich bin kein Muttersprachler')

t('courseFinder.n3.text', 'Dêrsim (Tunceli)')
t('courseFinder.common.continue', 'Weiter')

t('courseFinder.n4.text', 'Woher aus Dêrsim kommst du genau?')
t('courseFinder.n4.options.mamekiye', 'Mamekîye (Merkez)')
t('courseFinder.n4.options.mazgerd', 'Mazgêrd (Mazgirt)')
t('courseFinder.n4.options.pilemuriye', 'Pilemurîye (Pülümür)')
t('courseFinder.n4.options.pertage', 'Pêrtage (Pertek)')
t('courseFinder.n4.options.pulur', 'Pulur (Ovacık)')
t('courseFinder.n4.options.qisle', 'Qisle (Nazımiye)')
t('courseFinder.n4.options.xozat', 'Xozat (Hozat)')
t('courseFinder.n4.options.cemisgezek', 'Çemîşgezek')

t('courseFinder.n5.text', 'Mamekîye (Merkez) -> Ost-Dêrsim')
t('courseFinder.n5.description', 'Die in Mamekîye gesprochene Variante gehört zur Gruppe des Ost-Dêrsim Dialekts.')

t('courseFinder.n14.text', 'Mazgêrd -> Ost-Dêrsim')
t('courseFinder.n14.description', 'Die in Mazgêrd gesprochene Variante gehört zur Gruppe des Ost-Dêrsim Dialekts.')

t('courseFinder.n16.text', 'Pilemurîye -> Ost-Dêrsim')
t('courseFinder.n16.description', 'Die in Pilemurîye gesprochene Variante gehört zur Gruppe des Ost-Dêrsim Dialekts.')

t('courseFinder.n18.text', 'Pêrtage -> Ost-Dêrsim')
t('courseFinder.n18.description', 'Die in Pêrtage gesprochene Variante gehört zur Gruppe des Ost-Dêrsim Dialekts.')

t('courseFinder.n29.text', 'Qisle -> Ost-Dêrsim')
t('courseFinder.n29.description', 'Die in Qisle gesprochene Variante gehört zur Gruppe des Ost-Dêrsim Dialekts.')

t('courseFinder.n6.text', 'Dein Dialekt ist Ost-Dêrsim')

t('courseFinder.n7.text', 'Hast du Vorkenntnisse?')
t('courseFinder.n7.options.none', 'Ich kann gar nicht sprechen')
t('courseFinder.n7.options.basic', 'Ich kann grundlegende Konversation')
t('courseFinder.n7.options.fluent', 'Ich spreche fließend')

t('courseFinder.n8.text', 'Empfehlung: Ost-Dêrsim A1')
t('courseFinder.n8.result.dialect', 'Ost-Dêrsim')
t('courseFinder.n8.result.recommendation', 'Ost-Dêrsim A1')

t('courseFinder.n10.text', 'Empfehlung: Ost-Dêrsim A2')
t('courseFinder.n10.result.dialect', 'Ost-Dêrsim')
t('courseFinder.n10.result.recommendation', 'Ost-Dêrsim A2')

t('courseFinder.n12.text', 'Empfehlung: Ost-Dêrsim B1')
t('courseFinder.n12.result.dialect', 'Ost-Dêrsim')
t('courseFinder.n12.result.recommendation', 'Ost-Dêrsim B1')

t('courseFinder.n20.text', 'Pulur -> West-Dêrsim')
t('courseFinder.n20.description', 'Die in Pulur gesprochene Variante gehört zur Gruppe des West-Dêrsim Dialekts.')

t('courseFinder.n31.text', 'Xozat -> West-Dêrsim')
t('courseFinder.n31.description', 'Die in Xozat gesprochene Variante gehört zur Gruppe des West-Dêrsim Dialekts.')

t('courseFinder.n33.text', 'Çemîşgezek -> West-Dêrsim')
t('courseFinder.n33.description', 'Die in Çemîşgezek gesprochene Variante gehört zur Gruppe des West-Dêrsim Dialekts.')

t('courseFinder.n21.text', 'Dein Dialekt ist West-Dêrsim')

t('courseFinder.n22.text', 'Hast du Vorkenntnisse?')
t('courseFinder.n22.options.none', 'Ich kann gar nicht sprechen')
t('courseFinder.n22.options.basic', 'Ich kann grundlegende Konversation')
t('courseFinder.n22.options.fluent', 'Ich spreche fließend')

t('courseFinder.n23.text', 'Empfehlung: West-Dêrsim A1')
t('courseFinder.n23.result.dialect', 'West-Dêrsim')
t('courseFinder.n23.result.recommendation', 'West-Dêrsim A1')

t('courseFinder.n25.text', 'Empfehlung: West-Dêrsim A2')
t('courseFinder.n25.result.dialect', 'West-Dêrsim')
t('courseFinder.n25.result.recommendation', 'West-Dêrsim A2')

t('courseFinder.n27.text', 'Empfehlung: West-Dêrsim B1')
t('courseFinder.n27.result.dialect', 'West-Dêrsim')
t('courseFinder.n27.result.recommendation', 'West-Dêrsim B1')

t('courseFinder.n35.text', 'Çolîg -> Zentral-Zazakî')
t('courseFinder.n43.text', 'Pali -> Zentral-Zazakî')
t('courseFinder.n49.text', 'Xarpêt -> Zentral-Zazakî')

t('courseFinder.n46.text', 'Dein Dialekt ist Zentral-Zazakî')
t('courseFinder.n46.result.dialect', 'Zentral-Zazakî')
t('courseFinder.n46.result.recommendation', 'Zentral-Zazakî')

t('courseFinder.n37.text', 'Çêrmûge -> Süd-Zazakî')
t('courseFinder.n47.text', 'Sewrêgi -> Süd-Zazakî')

t('courseFinder.n38.text', 'Dein Dialekt ist Süd-Zazakî')
t('courseFinder.n38.result.dialect', 'Süd-Zazakî')
t('courseFinder.n38.result.recommendation', 'Süd-Zazakî')

t('courseFinder.n39.text', 'Erzingan')

t('courseFinder.n40.text', 'Erzingan-Dialekt')
t('courseFinder.n40.result.dialect', 'Erzingan-Dialekt')
t('courseFinder.n40.result.recommendation', 'Erzingan-Dialekt')

t('courseFinder.n41.text', 'Gimgim')
t('courseFinder.n51.text', 'Xinûs -> Gimgim-Xinûs')

t('courseFinder.n42.text', 'Gimgim-Xinûs-Dialekt')
t('courseFinder.n42.result.dialect', 'Gimgim-Xinûs-Dialekt')
t('courseFinder.n42.result.recommendation', 'Gimgim-Xinûs-Dialekt')

t('courseFinder.n45.text', 'Pîran')

t('courseFinder.n53.text', 'Kein Problem. Welcher Dialekt spricht dich denn an?')

t('courseFinder.n54.text', 'Das ist toll! Willkommen.')

t('courseFinder.n55.text', 'Welcher Dialekt spricht dich an?')
t('courseFinder.n55.options.north', 'Nord-Zazakî (Dêrsim/Erzincan/Varto)')
t('courseFinder.n55.options.central', 'Zentral-Zazakî (Bingöl/Palu/Elazığ)')
t('courseFinder.n55.options.south', 'Süd-Zazakî (Çermik/Siverek)')
t('courseFinder.n55.options.standard', 'Standard-Kurs (Gemischt)')

t('courseFinder.n56.text', 'Nord-Zazakî Varianten')
t('courseFinder.n56.options.ostDersim', 'Ost-Dêrsim')
t('courseFinder.n56.options.westDersim', 'West-Dêrsim')
t('courseFinder.n56.options.erzingan', 'Erzingan')
t('courseFinder.n56.options.gimgim', 'Gimgim-Xinûs')

*/

export const COURSE_FINDER_FLOW: Record<string, FlowNode> = {
    'n1': {
        id: 'n1',
        text: 'courseFinder.n1.text',
        type: 'question',
        options: [
            { label: 'courseFinder.n1.options.specific', nextId: 'n2' },
            { label: 'courseFinder.n1.options.standard', nextId: 'n64' }
        ]
    },
    'n64': {
        id: 'n64',
        text: 'courseFinder.n64.text',
        type: 'result',
        result: {
            dialect: 'courseFinder.n64.result.dialect',
            recommendation: 'courseFinder.n64.result.recommendation'
        }
    },
    'n65': {
        id: 'n65',
        text: 'courseFinder.n65.text',
        type: 'result',
        result: {
            dialect: 'courseFinder.n65.result.dialect',
            recommendation: 'courseFinder.n65.result.recommendation'
        }
    },
    'n2': {
        id: 'n2',
        text: 'courseFinder.n2.text',
        type: 'question',
        options: [
            { label: 'courseFinder.n2.options.dersim', nextId: 'n3' },
            { label: 'courseFinder.n2.options.cemisgezek', nextId: 'n33' },
            { label: 'courseFinder.n2.options.colig', nextId: 'n35' },
            { label: 'courseFinder.n2.options.cermuge', nextId: 'n37' },
            { label: 'courseFinder.n2.options.erzingan', nextId: 'n39' },
            { label: 'courseFinder.n2.options.gimgim', nextId: 'n41' },
            { label: 'courseFinder.n2.options.pali', nextId: 'n43' },
            { label: 'courseFinder.n2.options.piran', nextId: 'n45' },
            { label: 'courseFinder.n2.options.sewregi', nextId: 'n47' },
            { label: 'courseFinder.n2.options.xarpet', nextId: 'n49' },
            { label: 'courseFinder.n2.options.xinus', nextId: 'n51' },
            { label: 'courseFinder.n2.options.unknown', nextId: 'n53' },
            { label: 'courseFinder.n2.options.notNative', nextId: 'n54' }
        ]
    },
    // DERSIM BRANCH
    'n3': {
        id: 'n3',
        text: 'courseFinder.n3.text',
        type: 'info',
        image: '/images/course-finder/NZ.jpg',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n4' }]
    },
    'n4': {
        id: 'n4',
        text: 'courseFinder.n4.text',
        type: 'question',
        options: [
            { label: 'courseFinder.n4.options.mamekiye', nextId: 'n5' },
            { label: 'courseFinder.n4.options.mazgerd', nextId: 'n14' },
            { label: 'courseFinder.n4.options.pilemuriye', nextId: 'n16' },
            { label: 'courseFinder.n4.options.pertage', nextId: 'n18' },
            { label: 'courseFinder.n4.options.pulur', nextId: 'n20' },
            { label: 'courseFinder.n4.options.qisle', nextId: 'n29' },
            { label: 'courseFinder.n4.options.xozat', nextId: 'n31' },
            { label: 'courseFinder.n4.options.cemisgezek', nextId: 'n33' }
        ]
    },
    // EAST DERSIM GROUP
    'n5': {
        id: 'n5',
        text: 'courseFinder.n5.text',
        type: 'info',
        description: 'courseFinder.n5.description',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n6' }]
    },
    'n14': {
        id: 'n14',
        text: 'courseFinder.n14.text',
        type: 'info',
        description: 'courseFinder.n14.description',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n6' }]
    },
    'n16': {
        id: 'n16',
        text: 'courseFinder.n16.text',
        type: 'info',
        description: 'courseFinder.n16.description',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n6' }]
    },
    'n18': {
        id: 'n18',
        text: 'courseFinder.n18.text',
        type: 'info',
        description: 'courseFinder.n18.description',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n6' }]
    },
    'n29': {
        id: 'n29',
        text: 'courseFinder.n29.text',
        type: 'info',
        description: 'courseFinder.n29.description',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n6' }]
    },

    'n6': {
        id: 'n6',
        text: 'courseFinder.n6.text',
        type: 'info',
        image: '/images/course-finder/Ost-Dersim.png',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n7' }]
    },
    'n7': {
        id: 'n7',
        text: 'courseFinder.n7.text',
        type: 'question',
        options: [
            { label: 'courseFinder.n7.options.none', nextId: 'n8' },
            { label: 'courseFinder.n7.options.basic', nextId: 'n10' },
            { label: 'courseFinder.n7.options.fluent', nextId: 'n12' }
        ]
    },
    'n8': {
        id: 'n8',
        text: 'courseFinder.n8.text',
        type: 'result',
        result: { dialect: 'courseFinder.n8.result.dialect', level: 'A1', recommendation: 'courseFinder.n8.result.recommendation' }
    },
    'n10': {
        id: 'n10',
        text: 'courseFinder.n10.text',
        type: 'result',
        result: { dialect: 'courseFinder.n10.result.dialect', level: 'A2', recommendation: 'courseFinder.n10.result.recommendation' }
    },
    'n12': {
        id: 'n12',
        text: 'courseFinder.n12.text',
        type: 'result',
        result: { dialect: 'courseFinder.n12.result.dialect', level: 'B1', recommendation: 'courseFinder.n12.result.recommendation' }
    },

    // WEST DERSIM GROUP
    'n20': {
        id: 'n20',
        text: 'courseFinder.n20.text',
        type: 'info',
        description: 'courseFinder.n20.description',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n21' }]
    },
    'n31': {
        id: 'n31',
        text: 'courseFinder.n31.text',
        type: 'info',
        description: 'courseFinder.n31.description',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n21' }]
    },
    'n33': {
        id: 'n33',
        text: 'courseFinder.n33.text',
        type: 'info',
        description: 'courseFinder.n33.description',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n21' }]
    },

    'n21': {
        id: 'n21',
        text: 'courseFinder.n21.text',
        type: 'info',
        image: '/images/course-finder/West-Dersim.png',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n22' }]
    },
    'n22': {
        id: 'n22',
        text: 'courseFinder.n22.text',
        type: 'question',
        options: [
            { label: 'courseFinder.n22.options.none', nextId: 'n23' },
            { label: 'courseFinder.n22.options.basic', nextId: 'n25' },
            { label: 'courseFinder.n22.options.fluent', nextId: 'n27' }
        ]
    },
    'n23': {
        id: 'n23',
        text: 'courseFinder.n23.text',
        type: 'result',
        result: { dialect: 'courseFinder.n23.result.dialect', level: 'A1', recommendation: 'courseFinder.n23.result.recommendation' }
    },
    'n25': {
        id: 'n25',
        text: 'courseFinder.n25.text',
        type: 'result',
        result: { dialect: 'courseFinder.n25.result.dialect', level: 'A2', recommendation: 'courseFinder.n25.result.recommendation' }
    },
    'n27': {
        id: 'n27',
        text: 'courseFinder.n27.text',
        type: 'result',
        result: { dialect: 'courseFinder.n27.result.dialect', level: 'B1', recommendation: 'courseFinder.n27.result.recommendation' }
    },

    // CENTRAL ZAZAKI GROUP
    'n35': { id: 'n35', text: 'courseFinder.n35.text', type: 'info', image: '/images/course-finder/CZ.jpg', options: [{ label: 'courseFinder.common.continue', nextId: 'n46' }] },
    'n43': { id: 'n43', text: 'courseFinder.n43.text', type: 'info', image: '/images/course-finder/CZ.jpg', options: [{ label: 'courseFinder.common.continue', nextId: 'n46' }] },
    'n49': { id: 'n49', text: 'courseFinder.n49.text', type: 'info', image: '/images/course-finder/CZ.jpg', options: [{ label: 'courseFinder.common.continue', nextId: 'n46' }] },
    'n46': {
        id: 'n46',
        text: 'courseFinder.n46.text',
        type: 'result',
        image: '/images/course-finder/CZ.jpg',
        result: { dialect: 'courseFinder.n46.result.dialect', recommendation: 'courseFinder.n46.result.recommendation' }
    },

    // SOUTH ZAZAKI GROUP
    'n37': { id: 'n37', text: 'courseFinder.n37.text', type: 'info', image: '/images/course-finder/SZ.jpg', options: [{ label: 'courseFinder.common.continue', nextId: 'n38' }] },
    'n47': { id: 'n47', text: 'courseFinder.n47.text', type: 'info', image: '/images/course-finder/SZ.jpg', options: [{ label: 'courseFinder.common.continue', nextId: 'n38' }] },
    'n38': {
        id: 'n38',
        text: 'courseFinder.n38.text',
        type: 'result',
        image: '/images/course-finder/SZ.jpg',
        result: { dialect: 'courseFinder.n38.result.dialect', recommendation: 'courseFinder.n38.result.recommendation' }
    },

    // OTHER DIALECTS
    'n39': { id: 'n39', text: 'courseFinder.n39.text', type: 'info', image: '/images/course-finder/Erzingan.jpg', options: [{ label: 'courseFinder.common.continue', nextId: 'n40' }] },
    'n40': {
        id: 'n40',
        text: 'courseFinder.n40.text',
        type: 'result',
        image: '/images/course-finder/Erzingan.jpg',
        result: { dialect: 'courseFinder.n40.result.dialect', recommendation: 'courseFinder.n40.result.recommendation' }
    },

    'n41': { id: 'n41', text: 'courseFinder.n41.text', type: 'info', image: '/images/course-finder/Gimgim-Xinus.jpg', options: [{ label: 'courseFinder.common.continue', nextId: 'n42' }] },
    'n51': { id: 'n51', text: 'courseFinder.n51.text', type: 'info', image: '/images/course-finder/Gimgim-Xinus.jpg', options: [{ label: 'courseFinder.common.continue', nextId: 'n42' }] },
    'n42': {
        id: 'n42',
        text: 'courseFinder.n42.text',
        type: 'result',
        image: '/images/course-finder/Gimgim-Xinus.jpg',
        result: { dialect: 'courseFinder.n42.result.dialect', recommendation: 'courseFinder.n42.result.recommendation' }
    },

    'n45': { id: 'n45', text: 'courseFinder.n45.text', type: 'info', image: 'https://placehold.co/600x400/png?text=Region+Piran', options: [{ label: 'courseFinder.common.continue', nextId: 'n46' }] },

    // UNCLEAR / NON-NATIVE
    'n53': {
        id: 'n53',
        text: 'courseFinder.n53.text',
        type: 'info', // bridging
        options: [{ label: 'courseFinder.common.continue', nextId: 'n55' }]
    },
    'n54': {
        id: 'n54',
        text: 'courseFinder.n54.text',
        type: 'info',
        options: [{ label: 'courseFinder.common.continue', nextId: 'n55' }]
    },
    'n55': {
        id: 'n55',
        text: 'courseFinder.n55.text',
        type: 'question',
        options: [
            { label: 'courseFinder.n55.options.north', nextId: 'n56' },
            { label: 'courseFinder.n55.options.central', nextId: 'n46' },
            { label: 'courseFinder.n55.options.south', nextId: 'n38' },
            { label: 'courseFinder.n55.options.standard', nextId: 'n65' }
        ]
    },
    'n56': {
        id: 'n56',
        text: 'courseFinder.n56.text',
        type: 'question',
        options: [
            { label: 'courseFinder.n56.options.ostDersim', nextId: 'n6' },
            { label: 'courseFinder.n56.options.westDersim', nextId: 'n21' },
            { label: 'courseFinder.n56.options.erzingan', nextId: 'n40' },
            { label: 'courseFinder.n56.options.gimgim', nextId: 'n42' }
        ]
    }
}
