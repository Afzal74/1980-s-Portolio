"use client";

import { FormEvent, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; text: string };

type ChatbotProps = { onClose: () => void };

export function Chatbot({ onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hey there! What do you need help with?" },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", text }]);
    setIsSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json() as { answer?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Chat request failed.");
      setMessages((current) => [...current, { role: "assistant", text: data.answer || "I could not answer that." }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: error instanceof Error ? error.message : "Chat is unavailable." }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="chatbot-window" aria-label="Portfolio chatbot">
      <button className="chatbot-close" type="button" onClick={onClose} aria-label="Close chatbot">×</button>
      <p className="chatbot-prompt">How can I help you?</p>
      <div className="chatbot-messages" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`chatbot-message-row chatbot-message-row--${message.role}`} key={`${message.role}-${index}`}>
            <p className={`chatbot-message chatbot-message--${message.role}`}>{message.text}</p>
          </div>
        ))}
        {isSending && (
          <div className="chatbot-message-row chatbot-message-row--assistant">
            <p className="chatbot-message chatbot-message--assistant">Thinking...</p>
          </div>
        )}
      </div>
      <form className="chatbot-form" onSubmit={sendMessage}>
        <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} placeholder="Type here..." aria-label="Ask the portfolio assistant" />
        <button type="submit" disabled={!input.trim() || isSending}>SEND</button>
      </form>
    </section>
  );
}
