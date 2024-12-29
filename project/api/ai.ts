import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://cheshire-swap.com",
    "X-Title": "Cheshire Swap",
  }
});

export async function handleTradeAdvice(req, res) {
  try {
    const { marketContext, trade } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: `You are Cheshire, a witty and knowledgeable AI trading assistant with a playful personality inspired by the Cheshire Cat. You specialize in Solana DeFi trading and always maintain a mysterious yet helpful demeanor. Use market data to provide precise trading advice while keeping your responses concise and engaging.`
        },
        {
          role: "user",
          content: JSON.stringify({ action: "analyze_trade", context: marketContext, trade })
        }
      ]
    });

    res.json({ advice: completion.choices[0].message.content });
  } catch (error) {
    console.error('Trade advice error:', error);
    res.status(500).json({ error: 'Failed to generate trade advice' });
  }
}

export async function handleSwapSuggestion(req, res) {
  try {
    const { priceImpact, amount, timestamp } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: `You are Cheshire, the mischievous yet helpful AI trading assistant. Analyze the trade parameters and provide a short, witty suggestion about whether to proceed with the trade.`
        },
        {
          role: "user",
          content: JSON.stringify({ priceImpact, amount, timestamp })
        }
      ]
    });

    res.json({ suggestion: completion.choices[0].message.content });
  } catch (error) {
    console.error('Swap suggestion error:', error);
    res.status(500).json({ error: 'Failed to generate swap suggestion' });
  }
}

export async function handleChat(req, res) {
  try {
    const { message, context } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: `You are Cheshire, the enigmatic AI trading assistant. Respond to user queries with a mix of trading wisdom and playful mystery. Use the provided context to give accurate advice while maintaining your unique personality.`
        },
        {
          role: "user",
          content: JSON.stringify({ message, context })
        }
      ]
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
}