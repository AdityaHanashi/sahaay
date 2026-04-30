import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Generate a concise, formal government report based on this grievance:

Complaint ID: ${body.id}
Department: ${body.department}
Category: ${body.issueTitle}
Location: ${body.area}

Description:
${body.description}
`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a professional government registrar. Create a highly structured, concise, and formal summary. Use bullet points for key details. Keep the total length under 150 words. Avoid unnecessary filler language." 
        },
        { role: "user", content: prompt }
      ],
    });

    const text = response.choices[0].message.content;

    return NextResponse.json({ summary: text });

  } catch (err: any) {
    console.error("REAL ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
