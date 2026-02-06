import { JOBTREAD_GRAPHQL_URL } from './constants';

export interface JobTreadConfig {
  apiKey: string;
}

export interface Job {
  id: string;
  name: string;
  status: string;
  customer: string;
  address: string;
  estimatedRevenue: number;
  actualRevenue: number;
  estimatedCost: number;
  actualCost: number;
  startDate: string;
  endDate: string;
  progress: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  estimatedValue: number;
  createdAt: string;
  lastContact: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  jobName: string;
  crewMembers: string[];
  startDate: string;
  endDate: string;
  status: string;
  type: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossMargin: number;
  openInvoices: number;
  overdueInvoices: number;
  cashInFlow: number;
  cashOutFlow: number;
}

export class JobTreadClient {
  private apiKey: string;
  private isLive: boolean;

  constructor(config: JobTreadConfig) {
    this.apiKey = config.apiKey;
    this.isLive = !!config.apiKey && config.apiKey.length > 0;
  }

  private async query(graphqlQuery: string, variables?: Record<string, unknown>) {
    const response = await fetch(JOBTREAD_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query: graphqlQuery, variables }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`JobTread API error ${response.status}: ${response.statusText}. ${text}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`JobTread GraphQL error: ${data.errors.map((e: any) => e.message).join(', ')}`);
    }

    return data.data;
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    if (!this.isLive) {
      return { ok: false, error: 'No API key provided' };
    }
    try {
      await this.query(`query { viewer { id name email } }`);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }

  async getJobs(status?: string): Promise<Job[]> {
    if (!this.isLive) return getMockJobs();

    const graphqlQuery = `
      query GetJobs($status: String) {
        jobs(filter: { status: $status }, first: 50, orderBy: { field: "updatedAt", direction: DESC }) {
          edges {
            node {
              id
              name
              status
              customer { name }
              location { formattedAddress }
              estimatedRevenue
              actualRevenue
              estimatedCost
              actualCost
              startDate
              endDate
            }
          }
        }
      }
    `;

    const data = await this.query(graphqlQuery, { status });
    return (data?.jobs?.edges || []).map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      status: edge.node.status,
      customer: edge.node.customer?.name || 'Unknown',
      address: edge.node.location?.formattedAddress || '',
      estimatedRevenue: edge.node.estimatedRevenue || 0,
      actualRevenue: edge.node.actualRevenue || 0,
      estimatedCost: edge.node.estimatedCost || 0,
      actualCost: edge.node.actualCost || 0,
      startDate: edge.node.startDate || '',
      endDate: edge.node.endDate || '',
      progress: 0,
    }));
  }

  async getLeads(): Promise<Lead[]> {
    if (!this.isLive) return getMockLeads();

    const data = await this.query(`
      query GetLeads {
        contacts(filter: { type: "lead" }, first: 20, orderBy: { field: "createdAt", direction: DESC }) {
          edges {
            node {
              id
              name
              email
              phone
              source
              status
              createdAt
            }
          }
        }
      }
    `);
    return (data?.contacts?.edges || []).map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      email: edge.node.email || '',
      phone: edge.node.phone || '',
      source: edge.node.source || 'Direct',
      status: edge.node.status || 'New',
      estimatedValue: 0,
      createdAt: edge.node.createdAt,
      lastContact: edge.node.createdAt,
    }));
  }

  async getSchedule(startDate: string, endDate: string): Promise<ScheduleEvent[]> {
    if (!this.isLive) return getMockSchedule();

    const data = await this.query(`
      query GetSchedule($startDate: Date!, $endDate: Date!) {
        events(filter: { startDate: { gte: $startDate }, endDate: { lte: $endDate } }, first: 50) {
          edges {
            node {
              id
              title
              job { name }
              assignees { name }
              startDate
              endDate
              status
              type
            }
          }
        }
      }
    `, { startDate, endDate });
    return (data?.events?.edges || []).map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      jobName: edge.node.job?.name || '',
      crewMembers: (edge.node.assignees || []).map((a: any) => a.name),
      startDate: edge.node.startDate,
      endDate: edge.node.endDate,
      status: edge.node.status || 'scheduled',
      type: edge.node.type || 'task',
    }));
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    if (!this.isLive) return getMockFinancials();

    const data = await this.query(`
      query GetFinancials {
        financialSummary {
          totalRevenue
          totalCosts
          grossProfit
          grossMargin
          openInvoices
          overdueInvoices
        }
      }
    `);
    return data.financialSummary;
  }
}

// Static mock data functions (no demo fallback on errors — only used when no key is set)
export function getMockJobs(): Job[] {
  return [
    {
      id: 'job-001', name: 'Smith Residence - Full Reroof', status: 'In Progress',
      customer: 'John Smith', address: '1234 Oak Lane, Dallas TX',
      estimatedRevenue: 18500, actualRevenue: 9250, estimatedCost: 11200, actualCost: 5800,
      startDate: '2026-02-03', endDate: '2026-02-07', progress: 65,
    },
    {
      id: 'job-002', name: 'Johnson Commercial - TPO Flat Roof', status: 'In Progress',
      customer: 'Johnson Properties LLC', address: '5678 Business Pkwy, Fort Worth TX',
      estimatedRevenue: 42000, actualRevenue: 21000, estimatedCost: 28500, actualCost: 14200,
      startDate: '2026-02-01', endDate: '2026-02-14', progress: 45,
    },
    {
      id: 'job-003', name: 'Garcia Home - Storm Damage Repair', status: 'Scheduled',
      customer: 'Maria Garcia', address: '910 Elm St, Arlington TX',
      estimatedRevenue: 8900, actualRevenue: 0, estimatedCost: 5200, actualCost: 0,
      startDate: '2026-02-10', endDate: '2026-02-11', progress: 0,
    },
    {
      id: 'job-004', name: 'Williams Estate - Premium Metal Roof', status: 'Estimating',
      customer: 'Robert Williams', address: '2468 Maple Dr, Plano TX',
      estimatedRevenue: 35000, actualRevenue: 0, estimatedCost: 22000, actualCost: 0,
      startDate: '', endDate: '', progress: 0,
    },
    {
      id: 'job-005', name: 'Davis Office Park - Maintenance', status: 'Completed',
      customer: 'Davis Corp', address: '1357 Corporate Blvd, Irving TX',
      estimatedRevenue: 6500, actualRevenue: 6500, estimatedCost: 3800, actualCost: 3650,
      startDate: '2026-01-28', endDate: '2026-01-30', progress: 100,
    },
  ];
}

function getMockLeads(): Lead[] {
  return [
    { id: 'lead-001', name: 'Sarah Thompson', email: 'sarah@email.com', phone: '(214) 555-0123', source: 'Google Ads', status: 'New', estimatedValue: 12000, createdAt: '2026-02-05', lastContact: '2026-02-05' },
    { id: 'lead-002', name: 'Mike Chen', email: 'mike@email.com', phone: '(817) 555-0456', source: 'Referral', status: 'Contacted', estimatedValue: 28000, createdAt: '2026-02-04', lastContact: '2026-02-05' },
    { id: 'lead-003', name: 'Amanda Brooks', email: 'amanda@email.com', phone: '(972) 555-0789', source: 'Website', status: 'Proposal Sent', estimatedValue: 15000, createdAt: '2026-02-02', lastContact: '2026-02-04' },
    { id: 'lead-004', name: 'David Park', email: 'david@email.com', phone: '(469) 555-0321', source: 'Angi', status: 'New', estimatedValue: 9500, createdAt: '2026-02-06', lastContact: '2026-02-06' },
  ];
}

function getMockSchedule(): ScheduleEvent[] {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  return [
    { id: 'evt-001', title: 'Tear-off & Deck Inspection', jobName: 'Smith Residence', crewMembers: ['Carlos M.', 'James R.', 'Luis P.'], startDate: fmt(today), endDate: fmt(today), status: 'in_progress', type: 'task' },
    { id: 'evt-002', title: 'Underlayment & Flashing', jobName: 'Smith Residence', crewMembers: ['Carlos M.', 'James R.'], startDate: fmt(addDays(today, 1)), endDate: fmt(addDays(today, 1)), status: 'scheduled', type: 'task' },
    { id: 'evt-003', title: 'TPO Membrane Installation', jobName: 'Johnson Commercial', crewMembers: ['Team B - Marco', 'Team B - Kevin', 'Team B - Andre'], startDate: fmt(today), endDate: fmt(addDays(today, 2)), status: 'in_progress', type: 'task' },
    { id: 'evt-004', title: 'Inspection - City of Arlington', jobName: 'Garcia Home', crewMembers: [], startDate: fmt(addDays(today, 4)), endDate: fmt(addDays(today, 4)), status: 'scheduled', type: 'inspection' },
    { id: 'evt-005', title: 'Material Delivery - ABC Supply', jobName: 'Garcia Home', crewMembers: [], startDate: fmt(addDays(today, 3)), endDate: fmt(addDays(today, 3)), status: 'scheduled', type: 'delivery' },
    { id: 'evt-006', title: 'Measurement & Scope', jobName: 'Williams Estate', crewMembers: ['Nick P.'], startDate: fmt(addDays(today, 2)), endDate: fmt(addDays(today, 2)), status: 'scheduled', type: 'estimate' },
  ];
}

function getMockFinancials(): FinancialSummary {
  return {
    totalRevenue: 187500,
    totalCosts: 118200,
    grossProfit: 69300,
    grossMargin: 36.9,
    openInvoices: 12,
    overdueInvoices: 2,
    cashInFlow: 45200,
    cashOutFlow: 32100,
  };
}

export function createJobTreadClient(apiKey: string): JobTreadClient {
  return new JobTreadClient({ apiKey });
}
