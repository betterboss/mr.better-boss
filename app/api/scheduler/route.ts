import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/lib/constants';

const SCHEDULER_PROMPT = `${SYSTEM_PROMPT}

You are now in SCHEDULING MODE. Analyze the provided jobs and crew information and generate an optimized schedule.

Output the schedule in this exact JSON format:
{
  "schedule": [
    {
      "day": "string (YYYY-MM-DD)",
      "dayName": "string (Monday, Tuesday, etc.)",
      "assignments": [
        {
          "jobName": "string",
          "task": "string",
          "crew": ["string"],
          "startTime": "string (HH:MM)",
          "endTime": "string (HH:MM)",
          "priority": "high" | "medium" | "low",
          "notes": "string"
        }
      ]
    }
  ],
  "conflicts": ["string - any scheduling conflicts detected"],
  "recommendations": ["string - optimization suggestions"],
  "weatherAlerts": ["string - weather-related scheduling notes"],
  "materialDeliveries": ["string - material delivery coordination notes"]
}

Consider: weather forecasts, crew skills, job priorities, travel between sites, inspection schedules, and material deliveries. Return ONLY valid JSON.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { anthropicApiKey, jobs, crewMembers, dateRange, constraints } = body;

    if (!anthropicApiKey) {
      return NextResponse.json({ error: 'Anthropic API key required' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: anthropicApiKey });

    const userPrompt = `Generate an optimized schedule with these parameters:

Active Jobs:
${JSON.stringify(jobs || [], null, 2)}

Available Crew Members:
${JSON.stringify(crewMembers || ['Carlos M.', 'James R.', 'Luis P.', 'Marco T.', 'Kevin W.', 'Andre J.'], null, 2)}

Date Range: ${dateRange || 'Next 5 business days starting from today'}

Constraints:
${constraints || 'Standard 7AM-4PM work hours. Prioritize jobs by deadline. Account for DFW Texas weather.'}

Generate a detailed, optimized schedule that maximizes crew utilization and minimizes travel.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SCHEDULER_PROMPT,
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
      const schedule = JSON.parse(text);
      return NextResponse.json({ schedule });
    } catch {
      return NextResponse.json(
        { error: 'AI returned an invalid format. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Scheduler error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate schedule' },
      { status: 500 }
    );
  }
}
