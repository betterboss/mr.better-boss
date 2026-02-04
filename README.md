# Mr. Better Boss ⚡ - AI JobTread Assistant

A production-ready AI chatbot for JobTread users, powered by Claude with web search capabilities.

## Features

- 🤖 **AI-Powered Chat** - Uses Claude Sonnet 4 for intelligent responses
- 🔍 **Web Search** - Can search the web for current JobTread info, pricing, etc.
- 📚 **Full Better Boss Knowledge** - All expertise baked in
- 🔑 **User API Keys** - Each user adds their own Anthropic API key
- ⚙️ **Customizable** - Edit personality, quick actions, and more
- 💾 **Persistent Settings** - Saves to localStorage
- 📱 **Responsive** - Works on desktop and mobile

## Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mr-better-boss)

### Option 2: Manual Deploy

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/mr-better-boss.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repo
   - Click "Deploy"

3. **Done!** Your bot will be live at `your-project.vercel.app`

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

## How It Works

1. **User visits the site** → Sees API key modal
2. **User enters their Anthropic API key** → Key is validated and saved locally
3. **User chats** → Messages go to `/api/chat` endpoint
4. **Backend calls Claude API** → With web search enabled and Better Boss knowledge
5. **Response returned** → Displayed in chat

## Customization

### Edit Knowledge Base

The bot's knowledge is in `/app/api/chat/route.js` in the `BETTER_BOSS_KNOWLEDGE` constant. Add or modify info there.

### Edit Personality

The system prompt is in `SYSTEM_PROMPT` in the same file. Adjust tone, style, and behavior there.

### Edit Quick Actions

Users can customize quick actions in Settings, or you can modify the defaults in `/app/page.js` in `DEFAULT_SETTINGS`.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Claude Sonnet 4 via Anthropic SDK
- **Styling**: Inline styles (no dependencies)
- **Deployment**: Vercel Edge Functions

## Files Structure

```
mr-better-boss-app/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.js    # API endpoint (Claude + web search)
│   ├── layout.js           # Root layout
│   └── page.js             # Main chat UI
├── package.json
├── next.config.js
└── README.md
```

## Support

For help with JobTread implementation, visit [better-boss.ai/audit](https://better-boss.ai/audit)

---

Built with ⚡ by [Better Boss](https://better-boss.ai) - JobTread Certified Implementation Partner
