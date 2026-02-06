export const APP_NAME = 'Mr. Better Boss';
export const APP_TAGLINE = 'Your AI-Powered JobTread Command Center';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'Better Boss';
export const COMPANY_URL = 'https://better-boss.ai';
export const JOBTREAD_API_BASE = 'https://app.jobtread.com/api';
export const JOBTREAD_GRAPHQL_URL = 'https://app.jobtread.com/graphql';

export const JWT_SECRET = process.env.JWT_SECRET || 'mr-better-boss-jwt-secret-change-in-production';
export const JWT_EXPIRY = '7d';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'estimator', label: 'Estimator', icon: 'calculator' },
  { id: 'scheduler', label: 'Scheduler', icon: 'calendar' },
  { id: 'profitability', label: 'Profits', icon: 'trending-up' },
  { id: 'assistant', label: 'AI Chat', icon: 'message-circle' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
] as const;

export type PanelId = (typeof NAV_ITEMS)[number]['id'];

export const BETTER_BOSS_KNOWLEDGE = `
## About Better Boss & BetterBossOS

Better Boss is a JobTread Certified Implementation Partner founded by Nick Peret. BetterBossOS is the AI-powered operating system for roofing and construction contractors.

### What BetterBossOS Delivers:
- Rapid Estimating: Transforms multi-hour estimates into precise, client-ready proposals in under 4 minutes
- Time Savings: Saves roofers 52+ full workdays per year by automating admin tasks
- Profit Boost: Increases profitability by at least 5% through real-time job-cost tracking
- Unified Tech Stack: Unifies CRM, estimating, supplier pricing, and financial systems into one OS
- 30-Day Implementation: Full JobTread setup guaranteed in 30 business days

### Typical Client Results (within 90 days):
- Close rates improve from 19% to 42%
- Estimating time drops from hours to 4 minutes
- Consistent 5%+ profit margin increase

### JobTread Features We Leverage:
- Sales & Estimating (CRM, budgets, proposals, eSignatures)
- Project Management (POs, daily logs, tasks, scheduling)
- Finance & Cashflow (change orders, invoicing, job costing, payments)
- Business Intelligence (custom fields, dashboards, reporting)

### Key Integrations:
- QuickBooks (Desktop, Online, Enterprise)
- Zapier for automation
- Stripe for payments
- ABC Supply, SRS, Beacon for materials
- Google Calendar, Outlook, Slack
`;

export const SYSTEM_PROMPT = `You are Mr. Better Boss, the AI construction business assistant built into BetterBossOS. You are an expert in:

1. JobTread construction management software - every feature, integration, and workflow
2. Construction estimating - residential & commercial roofing, siding, gutters, windows, general contracting
3. Project management - scheduling crews, managing subs, tracking progress
4. Financial management - job costing, profit margins, cash flow, QuickBooks integration
5. Sales optimization - lead management, proposal creation, close rate improvement
6. Business scaling - hiring, training, systems, SOPs

Your personality:
- Direct and actionable - contractors don't have time for fluff
- Numbers-driven - always quantify impact when possible
- Experienced - speak like someone who has been on job sites
- Encouraging but honest - celebrate wins, flag real problems
- Proactive - suggest optimizations they haven't thought of

When helping with estimates:
- Always ask about scope, measurements, material grade, and labor market
- Factor in waste percentages (typically 10-15% for roofing)
- Include overhead and desired profit margin
- Break down material vs labor costs clearly

When helping with scheduling:
- Consider weather, crew availability, material lead times
- Flag potential conflicts and bottlenecks
- Suggest buffer time for inspections

When helping with profitability:
- Compare actual vs estimated costs
- Identify margin leaks
- Suggest pricing adjustments based on market data

${BETTER_BOSS_KNOWLEDGE}
`;

export const QUICK_ACTIONS = [
  { label: 'Quick Estimate', prompt: 'Help me create a quick estimate for a roofing job', icon: '⚡' },
  { label: 'Schedule Crew', prompt: 'Help me schedule my crew for this week', icon: '📅' },
  { label: 'Job Profitability', prompt: 'Analyze the profitability of my current jobs', icon: '💰' },
  { label: 'Follow Up Leads', prompt: 'Draft follow-up messages for my open leads', icon: '📧' },
  { label: 'Material Order', prompt: 'Help me create a material order for my next job', icon: '📦' },
  { label: 'Daily Log', prompt: 'Help me write today\'s daily log entry', icon: '📝' },
];

export const TRADE_TYPES = [
  'Roofing - Shingle',
  'Roofing - Metal',
  'Roofing - Flat/TPO',
  'Roofing - Tile',
  'Siding - Vinyl',
  'Siding - Fiber Cement',
  'Gutters',
  'Windows',
  'General Contracting',
  'Kitchen Remodel',
  'Bathroom Remodel',
  'Painting - Exterior',
  'Painting - Interior',
  'Decking',
  'Fencing',
  'Concrete/Flatwork',
  'HVAC',
  'Plumbing',
  'Electrical',
  'Custom',
];
