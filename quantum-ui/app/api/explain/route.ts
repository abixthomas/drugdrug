import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { smiles } = await req.json();
    
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        chemicalName: "API Key Required",
        explanation: "The molecule was generated perfectly! However, the Groq API key is missing from your .env.local file. Please add GROQ_API_KEY=your_key to view the AI explanation for this molecule.",
        specialties: "N/A",
        usage: "N/A"
      });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      messages: [
        {
           role: 'system',
           content: 'You are an expert computational chemist. The user provides a SMILES string of a newly generated quantum molecule. Explain it in JSON format EXACTLY as follows with no extra text: { "chemicalName": "...", "explanation": "...", "specialties": "...", "usage": "..." }'
        },
        {
           role: 'user',
           content: `Explain this SMILES string: ${smiles}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: "json_object" }
    });

    const outputContent = completion.choices[0]?.message?.content || "{}";
    const output = JSON.parse(outputContent);
    return NextResponse.json(output);

  } catch (error) {
    console.error("Groq Error:", error);
    return NextResponse.json({ 
        chemicalName: "API Processing Error",
        explanation: "Failed to communicate with Groq API. Please check your API key and connection.",
        specialties: "Error",
        usage: "Error"
    });
  }
}
