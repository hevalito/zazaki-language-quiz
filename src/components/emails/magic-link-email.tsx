import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Button,
    Hr,
} from '@react-email/components';
import React from 'react';

interface ZazakiMagicLinkEmailProps {
    url: string;
    host: string;
}

const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'https://quiz.zazakiacademy.com';

export const ZazakiMagicLinkEmail = ({
    url,
    host,
}: ZazakiMagicLinkEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Dein Login-Link für Zazakî Quiz</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={logoContainer}>
                        <Img
                            src={`${baseUrl}/images/logo-full.png`}
                            width="180"
                            height="90"
                            alt="Zazakî Quiz"
                            style={logo}
                        />
                    </Section>

                    <Heading style={h1}>Anmeldung bestätigen</Heading>

                    <Text style={text}>
                        Xêr ama! (Willkommen!)
                    </Text>

                    <Text style={text}>
                        Klicke auf den Button unten, um dich bei <strong>Zazakî Quiz</strong> anzumelden. Dieser Link ist für 24 Stunden gültig.
                    </Text>

                    <Section style={btnContainer}>
                        <Button style={button} href={url}>
                            Jetzt anmelden
                        </Button>
                    </Section>

                    <Text style={text}>
                        Oder kopiere diesen Link in deinen Browser:
                        <br />
                        <Link href={url} style={link}>
                            {url.replace(/^https?:\/\//, '')}
                        </Link>
                    </Text>

                    <Hr style={hr} />

                    <Text style={footer}>
                        Zazakî Quiz - Lerne Kurdisch auf spielerische Weise.
                        <br />
                        Wenn du diese E-Mail nicht angefordert hast, kannst du sie ignorieren.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default ZazakiMagicLinkEmail;

const main = {
    backgroundColor: '#ffffff',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '560px',
};

const logoContainer = {
    padding: '20px 0',
    textAlign: 'center' as const,
};

const logo = {
    margin: '0 auto',
    objectFit: 'contain' as const,
};

const h1 = {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const, // center for main focus
    margin: '30px 0',
    padding: '0',
    color: '#111827',
    fontFamily: 'Playfair Display, serif', // Attempt to use brand font if available/fallback
};

const text = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '26px',
    textAlign: 'center' as const,
};

const btnContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#febd11', // Primary Yellow
    borderRadius: '12px',
    color: '#111827', // Dark gray text for contrast
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
};

const link = {
    color: '#f28705', // Brand Orange
    textDecoration: 'underline',
};

const hr = {
    borderColor: '#e5e7eb',
    margin: '20px 0',
};

const footer = {
    color: '#9ca3af',
    fontSize: '12px',
    lineHeight: '20px',
    textAlign: 'center' as const,
};
