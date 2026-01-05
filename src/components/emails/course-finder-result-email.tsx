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

interface CourseFinderResultEmailProps {
    name?: string;
    dialect: string;
    recommendation: string;
    dashboardUrl: string;
}

const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'https://quiz.zazakiacademy.com';

export const CourseFinderResultEmail = ({
    name,
    dialect,
    recommendation,
    dashboardUrl,
}: CourseFinderResultEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Dein Zazakî-Kurs Ergebnis: {recommendation}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={logoContainer}>
                        <Img
                            src={`${baseUrl}/images/logo-full.png`}
                            width="180"
                            height="90"
                            alt="Zazakî Academy"
                            style={logo}
                        />
                    </Section>

                    <Heading style={h1}>Dein persönlicher Lernweg</Heading>

                    <Text style={text}>
                        Silam {name || 'Heval'},
                        <br />
                        wir freuen uns, dass du den Zazakî-Kursfinder genutzt hast. Hier ist dein Ergebnis:
                    </Text>

                    <Section style={resultBox}>
                        <Text style={resultLabel}>DEIN DIALEKT</Text>
                        <Heading style={resultValue}>{dialect}</Heading>
                        <Hr style={resultDivider} />
                        <Text style={resultLabel}>EMPFOHLENER KURS</Text>
                        <Heading style={resultValue}>{recommendation}</Heading>
                    </Section>

                    <Text style={text}>
                        Wir haben deinen Lernweg basierend auf deinen Antworten personalisiert. Dein Fortschritt wird gespeichert, sobald du dich anmeldest.
                    </Text>

                    <Section style={btnContainer}>
                        <Button style={button} href={dashboardUrl}>
                            Zum Kurs
                        </Button>
                    </Section>

                    <Hr style={hr} />

                    <Text style={footer}>
                        Zazakî Academy - Deine Plattform für die Zazakî Sprache.
                        <br />
                        <Link href={dashboardUrl} style={link}>
                            Zu meinem Dashboard
                        </Link>
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default CourseFinderResultEmail;

const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
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
    textAlign: 'center' as const,
    margin: '30px 0 20px',
    color: '#111827',
    fontFamily: 'Playfair Display, serif',
};

const text = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '26px',
    textAlign: 'center' as const,
    margin: '16px 0',
};

const resultBox = {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
    textAlign: 'center' as const,
};

const resultLabel = {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
};

const resultValue = {
    color: '#111827',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 16px',
    fontFamily: 'Playfair Display, serif',
};

const resultDivider = {
    borderColor: '#e5e7eb',
    margin: '16px 0',
};

const btnContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#febd11',
    borderRadius: '12px',
    color: '#111827',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
};

const hr = {
    borderColor: '#e5e7eb',
    margin: '32px 0 20px',
};

const footer = {
    color: '#9ca3af',
    fontSize: '12px',
    lineHeight: '20px',
    textAlign: 'center' as const,
};

const link = {
    color: '#f28705',
    textDecoration: 'underline',
};
