"use client";

import { useState } from "react";

type Message = { id: string; role: "user" | "assistant"; content: string };

export default function ChatPage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [streaming, setStreaming] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || streaming) return;

		const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: input };
		const history = [...messages, userMessage];
		setMessages(history);
		setInput("");
		setStreaming(true);

		const res = await fetch("/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ messages: history }),
		});

		const reader = res.body?.getReader();
		if (!reader) return;
		const decoder = new TextDecoder();
		let reply = "";

		const assistantId = crypto.randomUUID();
		setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			reply += decoder.decode(value, { stream: true });
			setMessages([...history, { id: assistantId, role: "assistant", content: reply }]);
		}

		setStreaming(false);
	};

	return (
		<div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Chat</h1>

			<div className="flex-1 overflow-y-auto space-y-4 mb-4">
				{messages.map((m) => (
					<div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
						<div
							className={`px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
						>
							{m.content}
						</div>
					</div>
				))}
				{streaming && messages[messages.length - 1]?.role !== "assistant" && (
					<div className="flex justify-start">
						<div className="px-4 py-2 rounded-2xl bg-muted text-muted-foreground">...</div>
					</div>
				)}
			</div>

			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Napisz wiadomość..."
					className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary bg-background"
				/>
				<button
					type="submit"
					disabled={streaming || !input.trim()}
					className="px-4 py-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-50"
				>
					Wyślij
				</button>
			</form>
		</div>
	);
}
