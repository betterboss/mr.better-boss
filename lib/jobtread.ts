import { JOBTREAD_API_URL } from './constants';

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
    let response: Response;
    try {
      response = await fetch(JOBTREAD_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ query: graphqlQuery, variables }),
      });
    } catch (err: any) {
      const msg = err?.cause?.code || err?.message || 'Unknown network error';
      throw new Error(`Could not connect to JobTread: ${msg}. Check your API key and network connection.`);
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid JobTread API key. Check your key in Settings.');
      }
      const text = await response.text().catch(() => '');
      throw new Error(`JobTread API error ${response.status}: ${response.statusText}. ${text}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`JobTread API error: ${data.errors.map((e: any) => e.message).join(', ')}`);
    }

    return data.data;
  }

  async testConnection(): Promise<{ ok: boolean; user?: string; error?: string }> {
    if (!this.isLive) {
      return { ok: false, error: 'No API key provided' };
    }
    try {
      // Simple viewer query to validate the API key
      const data = await this.query(`query { viewer { id name email } }`);
      return { ok: true, user: data?.viewer?.name || data?.viewer?.email };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }

  async getJobs(status?: string): Promise<Job[]> {
    if (!this.isLive) return getMockJobs();

    // JobTread API: query jobs with optional status filter
    // Uses the actual api.jobtread.com endpoint
    const filterArg = status ? `(filter: { status: "${status}" }, first: 50)` : '(first: 50)';
    const graphqlQuery = `
      query {
        jobs${filterArg} {
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

    const data = await this.query(graphqlQuery);
    return (data?.jobs?.edges || []).map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name || 'Untitled Job',
      status: edge.node.status || 'Unknown',
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

    // JobTread: leads are customers at an early pipeline stage, not a separate "contacts" entity
    const graphqlQuery = `
      query {
        customers(first: 20) {
          edges {
            node {
              id
              name
              contacts(first: 1) {
                edges {
                  node {
                    email
                    phone
                  }
                }
              }
              jobs(first: 1) {
                edges {
                  node {
                    status
                    estimatedRevenue
                  }
                }
              }
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.query(graphqlQuery);
    return (data?.customers?.edges || []).map((edge: any) => {
      const contact = edge.node.contacts?.edges?.[0]?.node;
      const job = edge.node.jobs?.edges?.[0]?.node;
      return {
        id: edge.node.id,
        name: edge.node.name || 'Unknown',
        email: contact?.email || '',
        phone: contact?.phone || '',
        source: 'Direct',
        status: job?.status || 'New',
        estimatedValue: job?.estimatedRevenue || 0,
        createdAt: edge.node.createdAt || '',
        lastContact: edge.node.createdAt || '',
      };
    });
  }

  async getSchedule(startDate: string, endDate: string): Promise<ScheduleEvent[]> {
    if (!this.isLive) return getMockSchedule();

    // JobTread: scheduling entity is "tasks", not "events"
    const graphqlQuery = `
      query($startDate: String!, $endDate: String!) {
        tasks(filter: { startDate: { gte: $startDate }, endDate: { lte: $endDate } }, first: 50) {
          edges {
            node {
              id
              name
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
    `;

    const data = await this.query(graphqlQuery, { startDate, endDate });
    return (data?.tasks?.edges || []).map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.name || 'Untitled Task',
      jobName: edge.node.job?.name || '',
      crewMembers: (edge.node.assignees || []).map((a: any) => a.name),
      startDate: edge.node.startDate || '',
      endDate: edge.node.endDate || '',
      status: edge.node.status || 'scheduled',
      type: edge.node.type || 'task',
    }));
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    if (!this.isLive) return getMockFinancials();

    // JobTread: no single "financialSummary" endpoint — compute from job-level data and documents
    const graphqlQuery = `
      query {
        jobs(first: 100) {
          edges {
            node {
              estimatedRevenue
              actualRevenue
              estimatedCost
              actualCost
            }
          }
        }
        documents(filter: { type: "invoice" }, first: 100) {
          edges {
            node {
              status
              total
              dueDate
            }
          }
        }
      }
    `;

    try {
      const data = await this.query(graphqlQuery);

      const jobs = data?.jobs?.edges || [];
      const documents = data?.documents?.edges || [];

      let totalRevenue = 0;
      let totalCosts = 0;

      for (const edge of jobs) {
        totalRevenue += edge.node.actualRevenue || edge.node.estimatedRevenue || 0;
        totalCosts += edge.node.actualCost || edge.node.estimatedCost || 0;
      }

      const grossProfit = totalRevenue - totalCosts;
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      let openInvoices = 0;
      let overdueInvoices = 0;
      let cashInFlow = 0;
      let cashOutFlow = totalCosts;
      const today = new Date().toISOString().split('T')[0];

      for (const edge of documents) {
        const doc = edge.node;
        if (doc.status === 'paid') {
          cashInFlow += doc.total || 0;
        } else if (doc.status === 'sent' || doc.status === 'open') {
          openInvoices++;
          if (doc.dueDate && doc.dueDate < today) {
            overdueInvoices++;
          }
        }
      }

      return { totalRevenue, totalCosts, grossProfit, grossMargin, openInvoices, overdueInvoices, cashInFlow, cashOutFlow };
    } catch {
      // If the documents query fails (field doesn't exist), fall back to jobs-only summary
      const jobsQuery = `
        query {
          jobs(first: 100) {
            edges {
              node {
                estimatedRevenue
                actualRevenue
                estimatedCost
                actualCost
              }
            }
          }
        }
      `;
      const data = await this.query(jobsQuery);
      const jobs = data?.jobs?.edges || [];

      let totalRevenue = 0;
      let totalCosts = 0;

      for (const edge of jobs) {
        totalRevenue += edge.node.actualRevenue || edge.node.estimatedRevenue || 0;
        totalCosts += edge.node.actualCost || edge.node.estimatedCost || 0;
      }

      const grossProfit = totalRevenue - totalCosts;
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      return { totalRevenue, totalCosts, grossProfit, grossMargin, openInvoices: 0, overdueInvoices: 0, cashInFlow: totalRevenue, cashOutFlow: totalCosts };
    }
  }
}

// Static mock data functions (only used when no API key is set)
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
