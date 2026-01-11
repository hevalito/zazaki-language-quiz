import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
    Hr,
} from '@react-email/components';
import React from 'react';

interface FeedbackReplyEmailProps {
    userFirstname?: string;
    feedbackMessage?: string;
    adminResponse?: string;
}

export const FeedbackReplyEmail = ({
    userFirstname = 'Besucher',
    feedbackMessage = 'Ich habe einen Käfer gefunden...',
    adminResponse = 'Danke für das Feedback! Wir haben es behoben.',
}: FeedbackReplyEmailProps) => {
    const previewText = `Antwort auf dein Feedback`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                brand: '#FF9A00',
                            },
                        },
                    },
                }}
            >
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Section className="mt-[32px]">
                            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                                Neues zu deinem Feedback
                            </Heading>

                            <Text className="text-black text-[14px] leading-[24px]">
                                Hallo {userFirstname},
                            </Text>

                            <Text className="text-black text-[14px] leading-[24px]">
                                Du hast uns folgendes Feedback gesendet:
                            </Text>

                            <Section className="bg-gray-50 p-4 rounded-md my-4 italic text-gray-600 border-l-4 border-gray-200">
                                <Text className="m-0 text-[13px]">"{feedbackMessage}"</Text>
                            </Section>

                            <Text className="text-black text-[14px] leading-[24px] mt-6 font-semibold">
                                Unsere Antwort:
                            </Text>

                            <Section className="bg-blue-50 p-4 rounded-md my-4 text-gray-800 border-l-4 border-[#FF9A00]">
                                <Text className="m-0 text-[14px]">{adminResponse}</Text>
                            </Section>

                            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                            <Text className="text-[#666666] text-[12px] leading-[24px]">
                                Danke, dass du uns hilfst, Zazaki Quiz besser zu machen!<br />
                                Dein Zazaki Quiz Team
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default FeedbackReplyEmail;
