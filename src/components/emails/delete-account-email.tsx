import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components'
import * as React from 'react'

interface DeleteAccountEmailProps {
    confirmUrl: string
    userName?: string
}

export const DeleteAccountEmail = ({
    confirmUrl,
    userName,
}: DeleteAccountEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Bestätige die Löschung deines Kontos</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Konto löschen</Heading>
                    <Text style={text}>
                        Hallo {userName || 'Nutzer'},
                    </Text>
                    <Text style={text}>
                        Wir haben eine Anfrage erhalten, dein Zazakî Quiz Konto dauerhaft zu löschen.
                        Wenn du das warst, bestätige dies bitte, indem du auf den untenstehenden Button klickst.
                    </Text>
                    <Text style={text}>
                        <strong>Achtung:</strong> Alle deine Fortschritte, XP und Abzeichen werden unwiderruflich gelöscht.
                    </Text>
                    <Section style={btnContainer}>
                        <Button style={button} href={confirmUrl}>
                            Konto dauerhaft löschen
                        </Button>
                    </Section>
                    <Text style={text}>
                        Wenn du das nicht warst, kannst du diese E-Mail einfach ignorieren. Dein Konto bleibt sicher.
                    </Text>
                    <Text style={footer}>
                        Zazakî Academy
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}

export default DeleteAccountEmail

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

const btnContainer = {
    textAlign: 'center' as const,
    marginBottom: '24px',
}

const button = {
    backgroundColor: '#ef4444', // Red for danger
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
}

const footer = {
    color: '#898989',
    fontSize: '14px',
    marginTop: '24px',
}
