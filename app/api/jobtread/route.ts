import { NextRequest, NextResponse } from 'next/server';
import { createJobTreadClient } from '@/lib/jobtread';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, jobtreadApiKey, params } = body;

    const hasKey = !!jobtreadApiKey && jobtreadApiKey.length > 0;
    const client = createJobTreadClient(hasKey ? jobtreadApiKey : '');

    switch (action) {
      case 'testConnection': {
        if (!hasKey) {
          return NextResponse.json({
            ok: false,
            error: 'No JobTread API key provided. Add your key in Settings.',
          });
        }
        const result = await client.testConnection();
        return NextResponse.json(result);
      }

      case 'getJobs': {
        const jobs = await client.getJobs(params?.status);
        return NextResponse.json({ jobs, isDemo: !hasKey });
      }

      case 'getLeads': {
        const leads = await client.getLeads();
        return NextResponse.json({ leads, isDemo: !hasKey });
      }

      case 'getSchedule': {
        const today = new Date();
        const startDate = params?.startDate || today.toISOString().split('T')[0];
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        const endDate = params?.endDate || endOfWeek.toISOString().split('T')[0];
        const schedule = await client.getSchedule(startDate, endDate);
        return NextResponse.json({ schedule, isDemo: !hasKey });
      }

      case 'getFinancials': {
        const financials = await client.getFinancialSummary();
        return NextResponse.json({ financials, isDemo: !hasKey });
      }

      case 'getDashboard': {
        const [jobs, leads, schedule, financials] = await Promise.all([
          client.getJobs(),
          client.getLeads(),
          client.getSchedule(
            new Date().toISOString().split('T')[0],
            new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
          ),
          client.getFinancialSummary(),
        ]);
        return NextResponse.json({ jobs, leads, schedule, financials, isDemo: !hasKey });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('JobTread API error:', error);
    return NextResponse.json(
      { error: error?.message || 'JobTread API error. Check your API key in Settings.' },
      { status: 500 }
    );
  }
}
