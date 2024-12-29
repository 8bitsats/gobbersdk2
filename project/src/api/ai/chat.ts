import { OpenAI } from 'openai';

const OPENROUTER_API_KEY = "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";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://cheshire-swap.com",
    "X-Title": "Cheshire Swap",
  }
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages
    });

    return new Response(JSON.stringify({
      content: completion.choices[0].message.content
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process AI request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}