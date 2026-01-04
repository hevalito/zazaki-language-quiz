
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components'
import * as React from 'react'

interface LowQuestionsPoolEmailProps {
    remainingCount: number
    daysLeft: number
    adminUrl: string
}

export default function LowQuestionsPoolEmail({
    remainingCount = 5,
    daysLeft = 1,
    adminUrl = 'https://quiz.zazakiacademy.com/admin/questions',
}: LowQuestionsPoolEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Wichtige Warnung: Der Fragenpool ist fast leer!</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[20px] font-normal text-center p-0 my-[30px] mx-0">
                            <strong>⚠️ Fragenpool fast leer</strong>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hallo Admin,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Der automatische Daily Quiz Generator hat festgestellt, dass nur noch <strong>{remainingCount} ungenutzte Fragen</strong> übrig sind.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Das reicht nur noch für ca. <strong>{daysLeft} Tag(e)</strong>. Bitte füge dringend neue Fragen hinzu, damit der tägliche Betrieb weiterlaufen kann.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#fbbf24] rounded text-black text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={adminUrl}
                            >
                                Jetzt Fragen hinzufügen
                            </Button>
                        </Section>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            Diese E-Mail wurde automatisch gesendet von deinem Zazakî Quiz Bot.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
