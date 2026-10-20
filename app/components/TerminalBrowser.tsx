import { FormEvent, useEffect, useRef, useState } from "react";
import type { ActiveSection } from "./types";

type TerminalBrowserProps = {
  onNavigate: (section: ActiveSection) => void;
};

type TerminalLine = {
  kind: "system" | "user";
  text: string;
};

const helpText = [
  "/about          Open About",
  "/projects       Open Projects",
  "/achievements   Open Achievements",
  "/skills         Show technology stack",
  "/experience     Show work experience",
  "/contact        Show contact details",
  "/clear          Clear terminal",
  "/help           Show available commands"
];

export function TerminalBrowser({ onNavigate }: TerminalBrowserProps) {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([
    { kind: "system", text: "> AFZAL.SYS v1.0" },
    { kind: "system", text: "> Type /help for commands" }
  ]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const terminal = terminalRef.current;
    if (terminal) terminal.scrollTop = terminal.scrollHeight;
    inputRef.current?.focus();
  }, [lines]);

  const write = (text: string) => {
    setLines((current) => [...current, { kind: "system", text }]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const command = input.trim().toLowerCase();
    if (!command) return;
    setInput("");
    setLines((current) => [...current, { kind: "user", text: `$ ${command}` }]);

    if (command === "/clear") {
      setLines([]);
      return;
    }
    if (command === "/help") {
      setLines((current) => [...current, { kind: "system", text: "> Available commands:" }, ...helpText.map((text) => ({ kind: "system" as const, text }))]);
      return;
    }
    if (command === "/about" || command === "/projects" || command === "/achievements") {
      const section = command.slice(1) as ActiveSection;
      write(`> Opening ${section}...`);
      window.setTimeout(() => onNavigate(section), 350);
      return;
    }
    const responses: Record<string, string> = {
      "/skills": "> React, Next.js, Tailwind CSS, GSAP, TypeScript, AI/ML",
      "/experience": "> Web Developer Intern | Anvelos Softwares | 2024",
      "/contact": "> Email: appuafzal777@gmail.com | GitHub: Afzal74"
    };
    write(responses[command] ?? `> Command not found: ${command}. Type /help.`);
  };

  return (
    <div className="terminal-browser" onPointerDown={(event) => event.stopPropagation()}>
      <div ref={terminalRef} className="terminal-output" aria-live="polite">
        {lines.map((line, index) => (
          <div className={`terminal-line ${line.kind}`} key={`${line.text}-${index}`}>{line.text}</div>
        ))}
        <span className="terminal-caret" aria-hidden="true">▋</span>
      </div>
      <form className="terminal-prompt" onSubmit={handleSubmit}>
        <span aria-hidden="true">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          aria-label="Terminal command"
          autoComplete="off"
          spellCheck={false}
          autoFocus
          onClick={(event) => event.currentTarget.focus()}
        />
      </form>
    </div>
  );
}
