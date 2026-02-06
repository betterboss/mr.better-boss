import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/lib/constants';

const ESTIMATE_PROMPT = `${SYSTEM_PROMPT}

You are now in ESTIMATE MODE. Generate a detailed, professional construction estimate based on the provided parameters.

Output the estimate in this exact JSON format:
{
  "projectName": "string",
  "customerName": "string",
  "tradeType": "string",
  "summary": "One-line description",
  "lineItems": [
    {
      "category": "Materials" | "Labor" | "Equipment" | "Permits" | "Overhead",
      "description": "string",
      "quantity": number,
      "unit": "string (sq ft, each, hours, etc.)",
      "unitCost": number,
      "totalCost": number
    }
  ],
  "subtotal": number,
  "wasteAllowance": number,
  "wastePercent": number,
  "overhead": number,
  "overheadPercent": number,
  "profit": number,
  "profitPercent": number,
  "totalPrice": number,
  "estimatedDuration": "string (e.g., 3-4 days)",
  "crewSize": number,
  "notes": ["string"],
  "assumptions": ["string"]
}

Be extremely accurate with pricing. Use current 2026 market rates for the DFW Texas area as a default unless another location is specified. Always include waste allowance. Return ONLY valid JSON, no markdown.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { anthropicApiKey, tradeType, measurements, materialGrade, laborMarket, customerName, projectName, profitMargin, location } = body;

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key required' },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey: anthropicApiKey });

    const userPrompt = `Generate a detailed estimate with these parameters:
- Trade Type: ${tradeType || 'Roofing - Shingle'}
- Project Name: ${projectName || 'Residential Reroof'}
- Customer: ${customerName || 'Homeowner'}
- Measurements: ${measurements || '2,000 sq ft roof, standard pitch 6/12'}
- Material Grade: ${materialGrade || 'Mid-range (30-year architectural shingles)'}
- Labor Market: ${laborMarket || 'DFW Texas metro - current rates'}
- Target Profit Margin: ${profitMargin || '35%'}
- Location: ${location || 'Dallas-Fort Worth, TX'}

Generate a complete, accurate estimate ready to present to the customer.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: ESTIMATE_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    let text = (textContent?.text || '').trim();

    // Strip markdown code fences if Claude wrapped the JSON
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    if (!text) {
      return NextResponse.json({ error: 'AI returned an empty response. Please try again.' }, { status: 500 });
    }

    try {
      const estimate = JSON.parse(text);
      return NextResponse.json({ estimate });
    } catch {
      return NextResponse.json(
        { error: 'AI returned an invalid format. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Estimate error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate estimate' },
      { status: 500 }
    );
  }
}
