import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        // Zmieniamy model na Opus 4.6
        model: anthropic('claude-opus-4-6'),
        messages,
        // Opcjonalnie: Możesz dodać parametry specyficzne dla modelu 4.6
        temperature: 0.7,
    });

    return result.toDataStreamResponse();
}