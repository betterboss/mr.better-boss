# Mr. Better Boss - AI-Powered JobTread Sidebar

**Your AI-Powered JobTread Command Center** by [BetterBossOS](https://better-boss.ai)

A production-ready sidebar application that makes JobTread 10,000x more powerful for contractors. Built by Better Boss, the JobTread Certified Implementation Partner founded by Nick Peret.

---

## What It Does

Mr. Better Boss is a sidebar application that sits alongside JobTread and supercharges every part of your construction business with AI. Each feature solves a real problem that contractors face daily.

## Features & Why They Exist

### 1. Dashboard - Real-Time Business Overview
**Problem:** Contractors fly blind -- scattered data across tabs, no consolidated view of business health.
**Solution:** One-glance dashboard showing active jobs, financials, today's schedule, new leads, and over-budget alerts. Pulls live data from JobTread's API.

### 2. Rapid Estimator - AI-Powered Estimates in Under 4 Minutes
**Problem:** Contractors spend 2-4 hours per estimate manually calculating materials, labor, and margins.
**Solution:** AI generates detailed, market-rate estimates with line items, waste allowances, overhead, and configurable profit margins. Supports 20+ trade types. BetterBossOS clients cut estimating time from hours to under 4 minutes.

### 3. Smart Scheduler - AI-Optimized Crew Scheduling
**Problem:** Scheduling chaos causes missed deadlines, idle crews, wasted travel time, and forgotten inspections.
**Solution:** AI analyzes active jobs, crew availability, weather, inspections, and material deliveries to generate optimized schedules with conflict detection and recommendations.

### 4. Profit Tracker - Real-Time Job Costing & Margin Analysis
**Problem:** Most contractors don't know their real profit until the job is done. Margin leaks go undetected.
**Solution:** Real-time per-job profitability tracking with over-budget alerts, cash flow monitoring, and margin analysis. BetterBossOS clients see 5%+ profit margin increases through this visibility.

### 5. AI Assistant - Construction Business Copilot
**Problem:** Contractors need quick answers on job sites -- about estimates, scheduling, materials, follow-ups -- but can't dig through menus or call the office every time.
**Solution:** Chat with an AI expert that understands your current jobs, financials, and schedule. Ask anything about estimating, job costing, lead follow-ups, material orders, or JobTread features.

### 6. Authentication & Settings
**Problem:** Secure access and easy API key management.
**Solution:** Full login/registration system with JWT sessions, demo mode for instant trial, and a settings panel for JobTread API key, Anthropic API key, and display mode configuration.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **AI Engine:** Claude via Anthropic SDK
- **Styling:** Tailwind CSS with custom BetterBossOS theme
- **Auth:** JWT-based sessions with bcrypt password hashing
- **Data:** JobTread GraphQL API integration with demo fallback
- **Deployment:** Vercel (one-click deploy ready)

## Architecture

```
mr-better-boss/
├── app/
│   ├── api/
│   │   ├── auth/route.ts         # Login, registration, JWT management
│   │   ├── chat/route.ts         # AI assistant chat endpoint
│   │   ├── estimates/route.ts    # AI estimate generation
│   │   ├── jobtread/route.ts     # JobTread data fetching
│   │   └── scheduler/route.ts    # AI schedule optimization
│   ├── globals.css               # BetterBossOS theme styles
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main app entry (auth gate)
├── components/
│   ├── Icons.tsx                 # SVG icon components
│   ├── LoginScreen.tsx           # Login/register/demo auth UI
│   ├── SidebarApp.tsx            # Main sidebar shell with nav
│   └── panels/
│       ├── DashboardPanel.tsx    # Business overview dashboard
│       ├── EstimatorPanel.tsx    # AI rapid estimator
│       ├── SchedulerPanel.tsx    # Smart crew scheduler
│       ├── ProfitabilityPanel.tsx # Job costing & margins
│       ├── AssistantPanel.tsx    # AI chat assistant
│       └── SettingsPanel.tsx     # Config & API keys
├── lib/
│   ├── auth.ts                   # JWT, bcrypt, user management
│   ├── constants.ts              # App config, prompts, knowledge base
│   └── jobtread.ts               # JobTread GraphQL client
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── vercel.json
└── .env.example
```

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mr-better-boss)

### Manual Deploy

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Set environment variable: `JWT_SECRET` (any random string)
4. Click Deploy

Your app will be live at `your-project.vercel.app`

## Local Development

```bash
# Install dependencies
npm install

# Create env file
cp .env.example .env.local
# Edit .env.local and set JWT_SECRET

# Run dev server
npm run dev

# Open http://localhost:3000
```

## How to Use

1. **Visit the app** -- You'll see the login screen
2. **Create an account** or click **Try Demo Mode** for instant access
3. **Go to Settings** (gear icon) and add your API keys:
   - **JobTread API Key** -- For live data (find at app.jobtread.com > Settings > API)
   - **Anthropic API Key** -- For AI features (get at console.anthropic.com)
4. **Explore the panels** -- Dashboard, Estimator, Scheduler, Profits, AI Chat

### Demo Mode
Without API keys, the app runs with realistic sample data so you can explore all features immediately. Add your keys anytime to switch to live data.

### Sidebar vs Full Page Mode
In Settings, switch between:
- **Full Page** -- Standalone app experience
- **Sidebar** -- Pins to the right side of your screen (420px wide) for use alongside JobTread

## BetterBossOS Results

Contractors using BetterBossOS typically see within 90 days:
- Close rates improve from 19% to 42%
- Estimating time drops from hours to 4 minutes
- 52+ workdays reclaimed per year
- 5%+ profit margin increase

## Support

For help with JobTread implementation, visit [better-boss.ai](https://better-boss.ai)

---

Built by [Better Boss](https://better-boss.ai) - JobTread Certified Implementation Partner
