import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
} from '@react-email/components'
import * as React from 'react'

interface GoodbyeEmailProps {
    userName?: string
}

export const GoodbyeEmail = ({
    userName,
}: GoodbyeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Auf Wiedersehen - Zazakî Quiz</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Schade, dass du gehst...</Heading>
                    <Text style={text}>
                        Hallo {userName || 'ehemaliger Nutzer'},
                    </Text>
                    <Text style={text}>
                        Dein Konto wurde erfolgreich gelöscht. Wir finden es sehr schade, dich zu verlieren, aber wir verstehen deine Entscheidung.
                    </Text>
                    <Text style={text}>
                        Danke, dass du versucht hast, Zazakî zu lernen. Jeder Schritt zählt, um diese schöne Sprache am Leben zu erhalten.
                    </Text>
                    <Text style={text}>
                        Unsere Türen stehen dir immer offen. Wenn du jemals wieder Zazakî lernen möchtest, freuen wir uns, dich wieder begrüßen zu dürfen.
                    </Text>
                    <Text style={text}>
                        Alles Gute für deine Zukunft!
                    </Text>
                    <Text style={footer}>
                        Dein Zazakî Academy Team
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}

export default GoodbyeEmail

const main = {
    backgroundColor: '#ffffff',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '560px',
}

const h1 = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#484848',
    marginBottom: '24px',
}

const text = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#484848',
    marginBottom: '24px',
}

const footer = {
    color: '#898989',
    fontSize: '14px',
    marginTop: '24px',
}
