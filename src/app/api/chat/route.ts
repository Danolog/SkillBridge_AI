import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
	const { messages } = await req.json();

	const result = streamText({
		model: anthropic("claude-sonnet-4-6"),
		messages,
	});

	return result.toTextStreamResponse();
}
