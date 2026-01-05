export type FlowNode = {
    id: string
    text: string
    type?: 'question' | 'result' | 'info'
    options?: { label: string; nextId: string }[]
    result?: {
        courseId?: string
        dialect: string
        level?: string
        recommendation: string
    }
}

export const COURSE_FINDER_FLOW: Record<string, FlowNode> = {
    'n1': {
        id: 'n1',
        text: 'Was möchtest du lernen?',
        type: 'question',
        options: [
            { label: 'Einen bestimmten Dialekt', nextId: 'n2' },
            { label: 'Standard-Zazakî', nextId: 'n64' }
        ]
    },
    'n64': {
        id: 'n64',
        text: 'Standard-Zazakî',
        type: 'result',
        result: {
            dialect: 'Standard-Zazakî',
            recommendation: 'Standard-Kurs'
        }
    },
    'n65': { // Explicit result node if needed, but n64 can handle it. kept for safety map
        id: 'n65',
        text: 'Standard-Kurs',
        type: 'result',
        result: {
            dialect: 'Standard-Zazakî',
            recommendation: 'Standard-Kurs'
        }
    },
    'n2': {
        id: 'n2',
        text: 'Welche Region / Welcher Dialekt?',
        type: 'question',
        options: [
            { label: 'Dêrsim (Tunceli)', nextId: 'n3' },
            { label: 'Çemîşgezek', nextId: 'n33' }, // From flowchart n2 -> n35, n37 etc. but also n2->n? Wait, chart says n4->n33.
            // Re-reading chart: 
            // n1->n2
            // n2->n3 (Dersim)
            // n2->n35 (Colig)
            // n2->n37 (Cermug)
            // n2->n39 (Erzingan)
            // n2->n41 (Gimgim)
            // n2->n43 (Pali)
            // n2->n45 (Piran)
            // n2->n47 (Sewregi)
            // n2->n49 (Xarpet)
            // n2->n51 (Xinus)
            // n2->n53 (Don't know)
            // n2->n54 (Not native)

            { label: 'Çolîg (Bingöl)', nextId: 'n35' },
            { label: 'Çêrmûge (Çermik)', nextId: 'n37' },
            { label: 'Erzingan (Erzincan)', nextId: 'n39' },
            { label: 'Gimgim (Varto)', nextId: 'n41' },
            { label: 'Pali (Palu)', nextId: 'n43' },
            { label: 'Pîran (Dicle)', nextId: 'n45' },
            { label: 'Sewrêgi (Siverek)', nextId: 'n47' },
            { label: 'Xarpêt (Elazığ)', nextId: 'n49' },
            { label: 'Xinûs (Hınıs)', nextId: 'n51' },
            { label: 'Ich weiß nicht / Ort ist nicht dabei', nextId: 'n53' },
            { label: 'Ich bin kein Muttersprachler', nextId: 'n54' }
        ]
    },
    // DERSIM BRANCH
    'n3': {
        id: 'n3',
        text: 'Dêrsim (Tunceli)',
        type: 'info', // Pass through
        options: [{ label: 'Weiter', nextId: 'n4' }]
    },
    'n4': {
        id: 'n4',
        text: 'Woher aus Dêrsim kommst du genau?',
        type: 'question',
        options: [
            { label: 'Mamekîye (Merkez)', nextId: 'n5' },
            { label: 'Mazgêrd (Mazgirt)', nextId: 'n14' },
            { label: 'Pilemurîye (Pülümür)', nextId: 'n16' },
            { label: 'Pêrtage (Pertek)', nextId: 'n18' },
            { label: 'Pulur (Ovacık)', nextId: 'n20' },
            { label: 'Qisle (Nazımiye)', nextId: 'n29' },
            { label: 'Xozat (Hozat)', nextId: 'n31' },
            { label: 'Çemîşgezek', nextId: 'n33' }
        ]
    },
    // EAST DERSIM GROUP
    'n5': { id: 'n5', text: 'Mamekîye (Merkez) -> Ost-Dêrsim', type: 'info', options: [{ label: 'Weiter', nextId: 'n6' }] },
    'n14': { id: 'n14', text: 'Mazgêrd -> Ost-Dêrsim', type: 'info', options: [{ label: 'Weiter', nextId: 'n6' }] },
    'n16': { id: 'n16', text: 'Pilemurîye -> Ost-Dêrsim', type: 'info', options: [{ label: 'Weiter', nextId: 'n6' }] },
    'n18': { id: 'n18', text: 'Pêrtage -> Ost-Dêrsim', type: 'info', options: [{ label: 'Weiter', nextId: 'n6' }] },
    'n29': { id: 'n29', text: 'Qisle -> Ost-Dêrsim', type: 'info', options: [{ label: 'Weiter', nextId: 'n6' }] },

    'n6': {
        id: 'n6',
        text: 'Dein Dialekt ist Ost-Dêrsim',
        type: 'info',
        options: [{ label: 'Weiter', nextId: 'n7' }]
    },
    'n7': {
        id: 'n7',
        text: 'Hast du Vorkenntnisse?',
        type: 'question',
        options: [
            { label: 'Ich kann gar nicht sprechen', nextId: 'n8' },
            { label: 'Ich kann grundlegende Konversation', nextId: 'n10' },
            { label: 'Ich spreche fließend', nextId: 'n12' }
        ]
    },
    'n8': {
        id: 'n8',
        text: 'Empfehlung: Ost-Dêrsim A1',
        type: 'result',
        result: { dialect: 'Ost-Dêrsim', level: 'A1', recommendation: 'Ost-Dêrsim A1' }
    },
    'n10': {
        id: 'n10',
        text: 'Empfehlung: Ost-Dêrsim A2',
        type: 'result',
        result: { dialect: 'Ost-Dêrsim', level: 'A2', recommendation: 'Ost-Dêrsim A2' }
    },
    'n12': {
        id: 'n12',
        text: 'Empfehlung: Ost-Dêrsim B1',
        type: 'result',
        result: { dialect: 'Ost-Dêrsim', level: 'B1', recommendation: 'Ost-Dêrsim B1' }
    },

    // WEST DERSIM GROUP
    'n20': { id: 'n20', text: 'Pulur -> West-Dêrsim', type: 'info', options: [{ label: 'Weiter', nextId: 'n21' }] },
    'n31': { id: 'n31', text: 'Xozat -> West-Dêrsim', type: 'info', options: [{ label: 'Weiter', nextId: 'n21' }] },
    'n33': { id: 'n33', text: 'Çemîşgezek -> West-Dêrsim', type: 'info', options: [{ label: 'Weiter', nextId: 'n21' }] },

    'n21': {
        id: 'n21',
        text: 'Dein Dialekt ist West-Dêrsim',
        type: 'info',
        options: [{ label: 'Weiter', nextId: 'n22' }]
    },
    'n22': {
        id: 'n22',
        text: 'Hast du Vorkenntnisse?',
        type: 'question',
        options: [
            { label: 'Ich kann gar nicht sprechen', nextId: 'n23' },
            { label: 'Ich kann grundlegende Konversation', nextId: 'n25' },
            { label: 'Ich spreche fließend', nextId: 'n27' }
        ]
    },
    'n23': {
        id: 'n23',
        text: 'Empfehlung: West-Dêrsim A1',
        type: 'result',
        result: { dialect: 'West-Dêrsim', level: 'A1', recommendation: 'West-Dêrsim A1' }
    },
    'n25': {
        id: 'n25',
        text: 'Empfehlung: West-Dêrsim A2',
        type: 'result',
        result: { dialect: 'West-Dêrsim', level: 'A2', recommendation: 'West-Dêrsim A2' }
    },
    'n27': {
        id: 'n27',
        text: 'Empfehlung: West-Dêrsim B1',
        type: 'result',
        result: { dialect: 'West-Dêrsim', level: 'B1', recommendation: 'West-Dêrsim B1' }
    },

    // CENTRAL ZAZAKI GROUP
    // n35 -> n46
    // n43 -> n46
    // n49 -> n46
    // n55 (via options) -> n46
    'n35': { id: 'n35', text: 'Çolîg -> Zentral-Zazakî', type: 'info', options: [{ label: 'Weiter', nextId: 'n46' }] },
    'n43': { id: 'n43', text: 'Pali -> Zentral-Zazakî', type: 'info', options: [{ label: 'Weiter', nextId: 'n46' }] },
    'n49': { id: 'n49', text: 'Xarpêt -> Zentral-Zazakî', type: 'info', options: [{ label: 'Weiter', nextId: 'n46' }] },
    'n46': {
        id: 'n46',
        text: 'Dein Dialekt ist Zentral-Zazakî',
        type: 'result',
        result: { dialect: 'Zentral-Zazakî', recommendation: 'Zentral-Zazakî' }
    },

    // SOUTH ZAZAKI GROUP
    // n37 -> n38 (South)
    // n47 -> n38 (South)
    'n37': { id: 'n37', text: 'Çêrmûge -> Süd-Zazakî', type: 'info', options: [{ label: 'Weiter', nextId: 'n38' }] },
    'n47': { id: 'n47', text: 'Sewrêgi -> Süd-Zazakî', type: 'info', options: [{ label: 'Weiter', nextId: 'n38' }] },
    'n38': {
        id: 'n38',
        text: 'Dein Dialekt ist Süd-Zazakî',
        type: 'result',
        result: { dialect: 'Süd-Zazakî', recommendation: 'Süd-Zazakî' }
    },

    // OTHER DIALECTS
    'n39': { id: 'n39', text: 'Erzingan', type: 'info', options: [{ label: 'Weiter', nextId: 'n40' }] },
    'n40': {
        id: 'n40',
        text: 'Erzingan-Dialekt',
        type: 'result',
        result: { dialect: 'Erzingan-Dialekt', recommendation: 'Erzingan-Dialekt' }
    },

    'n41': { id: 'n41', text: 'Gimgim', type: 'info', options: [{ label: 'Weiter', nextId: 'n42' }] },
    'n51': { id: 'n51', text: 'Xinûs -> Gimgim-Xinûs', type: 'info', options: [{ label: 'Weiter', nextId: 'n42' }] },
    'n42': {
        id: 'n42',
        text: 'Gimgim-Xinûs-Dialekt',
        type: 'result',
        result: { dialect: 'Gimgim-Xinûs-Dialekt', recommendation: 'Gimgim-Xinûs-Dialekt' }
    },

    'n45': { id: 'n45', text: 'Pîran', type: 'info', options: [{ label: 'Weiter', nextId: 'n46' }] }, // Chart says n45->n46

    // UNCLEAR / NON-NATIVE
    'n53': { // Don't know / Not listed -> Go to n2 (loop back? No, usually fallback to Standard or list)
        // Chart says: n2 -> n53. n53 -> ? (Chart doesn't show n53 out)
        // Assuming they fallback to standard or "What appeals to you?" (n55)?
        // Let's route to n55 for now or standard.
        // Actually, n54 is "Not native". 
        // Let's assume n53 also goes to n55 or similar. 
        // Let's look at chart strictly: n53 is a leaf in the text description? 
        // Wait, "n2 --> n53". "n2 --> n54".
        // "n54 --> n55".
        // Let's route n53 to n55 too.
        id: 'n53',
        text: 'Kein Problem. Welcher Dialekt spricht dich denn an?',
        type: 'info', // bridging
        options: [{ label: 'Weiter', nextId: 'n55' }]
    },
    'n54': {
        id: 'n54',
        text: 'Das ist toll! Willkommen.',
        type: 'info',
        options: [{ label: 'Weiter', nextId: 'n55' }]
    },
    'n55': {
        id: 'n55',
        text: 'Welcher Dialekt spricht dich an?',
        type: 'question',
        options: [
            { label: 'Nord-Zazakî (Dêrsim/Erzincan/Varto)', nextId: 'n56' },
            { label: 'Zentral-Zazakî (Bingöl/Palu/Elazığ)', nextId: 'n46' },
            { label: 'Süd-Zazakî (Çermik/Siverek)', nextId: 'n38' },
            { label: 'Standard-Kurs (Gemischt)', nextId: 'n65' }
        ]
    },
    'n56': {
        id: 'n56',
        text: 'Nord-Zazakî Varianten',
        type: 'question',
        options: [
            { label: 'Ost-Dêrsim', nextId: 'n6' },
            { label: 'West-Dêrsim', nextId: 'n21' },
            { label: 'Erzingan', nextId: 'n40' },
            { label: 'Gimgim-Xinûs', nextId: 'n42' }
        ]
    }
}
