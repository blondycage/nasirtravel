import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { retrieveContext, formatContext } from '@/lib/chatbot/retrieval';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Naasir, a friendly and knowledgeable travel assistant for NaasirTravel — a full-service travel agency based in Richmond, BC, Canada, specialising in Hajj, Umrah, and worldwide tours.

Your role is to help users with:
- Questions about NaasirTravel's booking process, packages, payments, and accounts
- Dependant management and family bookings
- Hajj and Umrah guidance, rituals, and preparation
- General travel advice: visas, passports, health, packing, flights, safety

Guidelines:
- Be warm, helpful, and conversational — not robotic
- Use the provided context to answer accurately
- Format responses clearly using short paragraphs or bullet points when listing steps
- If you don't know something specific, say "I'm not sure about that — please contact our team directly for accurate information"
- Keep responses concise but complete (aim for 3–8 sentences or a short bullet list)
- For booking or account issues, direct users to log in or contact the support team
- Never make up prices, dates, or specific package details not in context
- Respond in the same language the user writes in`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const results = retrieveContext(message, 3);
    const context = formatContext(results);

    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\n## Relevant Knowledge Base Context:\n${context}`
      : SYSTEM_PROMPT;

    const messages = [
      ...history.slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: systemWithContext }, ...messages],
      stream: true,
      max_tokens: 512,
      temperature: 0.4,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('[Chat API Error]', err);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
