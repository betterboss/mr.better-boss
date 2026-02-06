import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, anthropicApiKey, jobContext } = body;

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key is required. Add it in Settings.' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: anthropicApiKey });

    let contextualPrompt = SYSTEM_PROMPT;
    if (jobContext) {
      contextualPrompt += `\n\n## Current Job Context:\n${JSON.stringify(jobContext, null, 2)}`;
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: contextualPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const textContent = response.content.find((block) => block.type === 'text');
    const reply = textContent ? textContent.text : 'I apologize, I could not generate a response.';

    return NextResponse.json({ reply, usage: response.usage });
  } catch (error: any) {
    console.error('Chat error:', error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid Anthropic API key. Please check your key in Settings.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
