import { NextResponse } from "next/server";

const systemInstruction = `You are the helpful portfolio assistant for Afzal Basheer.
Answer questions about Afzal, his skills, projects, experience, and portfolio using only information visible in this portfolio.
If the portfolio does not provide an answer, say that you do not have that information and suggest contacting Afzal.
Be concise, friendly, and professional. Do not claim to be Afzal and do not invent personal details.`;

export async function POST(request: Request) {
  const apiKey = process.env.Gemini_API_Key;
  if (!apiKey) {
    return NextResponse.json({ error: "Chat is not configured yet." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const message = typeof body === "object" && body !== null && "message" in body
    ? (body as { message?: unknown }).message
    : undefined;
  if (typeof message !== "string" || !message.trim() || message.length > 500) {
    return NextResponse.json({ error: "Please enter a message up to 500 characters." }, { status: 400 });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: message.trim() }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.6 },
      }),
    },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "The assistant could not respond right now." }, { status: 502 });
  }

  const data = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!answer) {
    return NextResponse.json({ error: "The assistant returned an empty response." }, { status: 502 });
  }

  return NextResponse.json({ answer });
}
