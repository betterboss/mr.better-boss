import { NextRequest, NextResponse } from 'next/server';
import { createJobTreadClient } from '@/lib/jobtread';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, jobtreadApiKey, params } = body;

    // Use demo data if no API key provided
    const client = createJobTreadClient(jobtreadApiKey || 'demo');

    switch (action) {
      case 'getJobs': {
        const jobs = await client.getJobs(params?.status);
        return NextResponse.json({ jobs });
      }
      case 'getLeads': {
        const leads = await client.getLeads();
        return NextResponse.json({ leads });
      }
      case 'getSchedule': {
        const today = new Date();
        const startDate = params?.startDate || today.toISOString().split('T')[0];
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        const endDate = params?.endDate || endOfWeek.toISOString().split('T')[0];
        const schedule = await client.getSchedule(startDate, endDate);
        return NextResponse.json({ schedule });
      }
      case 'getFinancials': {
        const financials = await client.getFinancialSummary();
        return NextResponse.json({ financials });
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
        return NextResponse.json({ jobs, leads, schedule, financials });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('JobTread API error:', error);
    return NextResponse.json(
      { error: error?.message || 'JobTread API error' },
      { status: 500 }
    );
  }
}
