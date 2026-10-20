"use client";

import { useState } from "react";

type ContactBrowserProps = {
  onClose: () => void;
};

type FormState = { name: string; email: string; message: string };
type FormStatus = { type: "idle" | "success" | "error"; message: string };

export function ContactBrowser({ onClose }: ContactBrowserProps) {
  const [formState, setFormState] = useState<FormState>({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>({ type: "idle", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setFormStatus({ type: "idle", message: "" });
    try {
      const res = await fetch("https://formspree.io/f/your_form_id", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formState),
      });
      if (res.ok) {
        setFormStatus({ type: "success", message: "Message sent successfully!" });
        setFormState({ name: "", email: "", message: "" });
      } else {
        setFormStatus({ type: "error", message: "Failed to send. Please try again." });
      }
    } catch {
      setFormStatus({ type: "error", message: "Network error. Check your connection." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="contact-browser">
      <h1 className="contact-heading">CONTACT ME</h1>
      <p className="contact-desc">Got something to say? Drop a message and I'll get back to you.</p>

      <form onSubmit={handleSubmit} className="contact-form" noValidate>
        <input
          type="text"
          required
          placeholder="Your name"
          value={formState.name}
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
          className="contact-input"
        />
        <input
          type="email"
          required
          placeholder="Your email"
          value={formState.email}
          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
          className="contact-input"
        />
        <textarea
          required
          placeholder="Your message..."
          value={formState.message}
          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
          className="contact-input contact-textarea"
        />

        <button
          type="submit"
          disabled={isSending}
          className={`contact-submit${isSending ? " contact-submit--sending" : ""}`}
        >
          {isSending ? "SENDING..." : "SEND MESSAGE"}
        </button>

        {formStatus.message && (
          <p className={`contact-status contact-status--${formStatus.type}`}>
            {formStatus.message}
          </p>
        )}
      </form>
    </div>
  );
}
