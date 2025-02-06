import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
    });

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
