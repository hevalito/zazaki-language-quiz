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

interface CourseFinderLoginEmailProps {
    url: string;
    dialect: string;
}

const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'https://quiz.zazakiacademy.com';

export const CourseFinderLoginEmail = ({
    url,
    dialect,
}: CourseFinderLoginEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Dein Ergebnis ist da! Jetzt anmelden.</Preview>
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

                    <Heading style={h1}>Dein Ergebnis ist bereit</Heading>

                    <Text style={text}>
                        Wir haben deinen Dialekt (<strong>{dialect}</strong>) analysiert.
                        <br />
                        Klicke auf den Button, um dich anzumelden und deinen Kurs zu starten.
                    </Text>

                    <Section style={btnContainer}>
                        <Button style={button} href={url}>
                            Ergebnis ansehen & Starten
                        </Button>
                    </Section>

                    <Text style={text}>
                        Oder kopiere diesen Link:
                        <br />
                        <Link href={url} style={link}>
                            {url.replace(/^https?:\/\//, '')}
                        </Link>
                    </Text>

                    <Hr style={hr} />

                    <Text style={footer}>
                        Der Link ist 24 Stunden gültig.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default CourseFinderLoginEmail;

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
    margin: '30px 0',
    color: '#111827',
    fontFamily: 'Playfair Display, serif',
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
    color: '#111827',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 28px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const link = {
    color: '#f28705',
    textDecoration: 'underline',
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
