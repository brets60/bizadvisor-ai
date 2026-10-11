# BizAdvisor AI — Practical AI-Powered Business Advisory Platform

BizAdvisor AI is a full-stack, enterprise-grade business advisory application designed to help aspiring entrepreneurs, startup founders, freelancers, online sellers, and growing businesses make better, data-driven business decisions through personalized AI advice and deterministic planning tools.

Built specifically with Philippine market support by default (PHP `₱` currency, Asia/Manila time zone, local business regulatory context such as DTI, SEC, BIR, and Barangay permits), with multi-currency and regional flexibility.

---

## 🌟 Key Features

### 1. Context-Aware AI Business Advisor
- **Personalized Context Injection**: Every query automatically integrates the user's industry, business stage, available budget, target audience, and primary challenges.
- **Structured Advisory Output**:
  1. Understanding the problem
  2. Recommended approach
  3. Step-by-step action plan
  4. Estimated budget / resources (clearly labeled as preliminary assumptions)
  5. Potential risks & trade-offs
  6. How to measure success
  7. Suggested next steps
- **Conversation Management**: Live chat streaming/saving, message bookmarking to Knowledge Library, response copying, answer regeneration, and dynamic follow-up prompts.

### 2. Business Idea Generator & Comparison
- Inputs: Available capital, industry preference, skills & interests, location/market, business model (online, physical, hybrid), time commitment, and risk profile.
- Outputs: Viable tailored concepts with preliminary startup cost ranges, explicit assumptions, value proposition, revenue model, marketing strategy, risks, and validation steps.
- **Side-by-Side Comparison**: Compare shortlisted concepts in an interactive modal table.

### 3. 14-Section Business Plan Generator
- Generates and manages editable, bankable business plans across 14 standard sections:
  1. Executive summary
  2. Business description & mission
  3. Customer problem & market need
  4. Products or services portfolio
  5. Target market & persona
  6. Competitive positioning
  7. Marketing & customer acquisition
  8. Operational plan & supply chain
  9. Startup cost estimates
  10. Revenue assumptions
  11. Operating expense assumptions
  12. Break-even analysis
  13. Risks & mitigation
  14. First 90-day action plan
- **Section-Level AI Regeneration**: Customize and regenerate any single section on demand.
- **Version Control & Markdown Export**: Download plans as `.md` or `.txt`.

### 4. Interactive Financial Planning Tools (Deterministic Math Engine)
Deterministic mathematical calculations paired with AI financial interpretations:
1. **Startup Cost Calculator**: Equipment, inventory, rent/deposits, permits, marketing, working capital reserve, and contingency budget with percentage allocation chart.
2. **Profit Margin Calculator**: Cost of goods sold, variable costs, gross profit, gross margin %, and cost markup % with full formula transparency.
3. **Break-Even Calculator**: Fixed operating costs, unit selling price, unit variable cost, contribution margin per unit, break-even unit volume, and break-even monthly revenue.
4. **Cash Flow Planner**: 6-month monthly inflow/outflow forecast with cumulative cash reserve curves and minimum balance alerts.
- **Explain with AI**: Fractional CFO evaluations of calculated metrics highlighting red flags and 3 concrete margin-boosting actions.

### 5. Marketing Strategy & Social Copy Generator
- 4-week campaign execution calendar with channel allocations.
- Ready-to-publish social captions with hooks, value copy, call-to-actions, and hashtags (supports Taglish, English, and conversational tones).
- Performance KPIs with target tracking.

### 6. Business Growth Planner
- Structured sprint management for repeat purchases, pricing, cost cutting, and channel expansion.
- Genuine completion rates calculated strictly from database records (no fabricated analytics).

### 7. Market & Competitor Research Workspace
- Strict 3-way separation of:
  - Verified market realities
  - User-provided assumptions
  - AI-generated hypotheses
- Practical, low-cost field research checklist for local demand testing.

### 8. Business Knowledge Library
- Centralized search, type filtering (Conversations, Ideas, Plans, Marketing, Financials, Research), and sorting.

### 9. Security, Authentication & Data Privacy
- Live password checklist (12+ chars, uppercase, lowercase, number, special char, no spaces, not common).
- Password strength meter and show/hide toggles.
- Sliding-window in-memory API rate limiter.
- Full JSON account data export and permanent account deletion.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Next.js Route Handlers, TypeScript, JWT Session Cookies, Bcrypt.js, Sliding-Window Rate Limiting |
| **Database** | PostgreSQL / SQLite (turnkey local dev), Prisma ORM, Supabase PostgreSQL compatible |
| **AI Integration** | Google Gemini API (`@google/generative-ai`), structured JSON extraction, timeout & retry handling |
| **Testing** | Vitest (Automated unit tests for financial math and password validation) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or Node.js 24+
- npm 9+

### 2. Environment Setup
Copy `.env.example` to `.env.local` and `.env`:
```bash
cp .env.example .env.local
cp .env.example .env
```

Configure your environment variables:
```env
# Database URL (SQLite for zero-config local dev, or Supabase PostgreSQL)
DATABASE_URL="file:./dev.db"

# JWT Secret for session authentication
JWT_SECRET="bizadvisor-super-secret-jwt-key-minimum-32-chars-long"

# Google Gemini API Key (Required for live AI generation)
# Obtain from https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your-gemini-api-key"

# Defaults
NEXT_PUBLIC_DEFAULT_CURRENCY="PHP"
NEXT_PUBLIC_DEFAULT_TIMEZONE="Asia/Manila"
NEXT_PUBLIC_DEFAULT_COUNTRY="Philippines"
```

### 3. Database Initialization
Generate the Prisma Client and sync the database schema:
```bash
npx prisma generate
npx prisma db push
```

### 4. Optional: Seed Demo Account
Seed the database with a pre-configured demo business account (`Juan Dela Cruz` - `founder@bizadvisor.ph`):
```bash
npm run db:seed
```
*Demo Login:*
- **Email**: `founder@bizadvisor.ph`
- **Password**: `DemoPass2026!PH`

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests

Run the test suite with Vitest:
```bash
npm test
```
The test suite covers:
- Deterministic formulas for Startup Costs, Profit Margin, Markup, Break-Even volume, and Cash Flow trajectories.
- Strict password validation rules, strength scoring, and registration schema integrity.

---

## 🗄️ Database Schema & Models

The application implements 10 relational entities in `prisma/schema.prisma` and `prisma/migrations/01_postgresql_init/migration.sql`:
- `profiles`: User credentials, email verification status, country, and preferred currency.
- `business_profiles`: Business stage, industry, budget range, target market, primary goals, and current friction.
- `conversations`: AI advisory conversation threads.
- `messages`: Individual chat messages with role and library bookmark flags.
- `business_ideas`: Tailored ideas, preliminary cost ranges, and validation steps.
- `business_plans`: 14-section plans with auto-incrementing versions.
- `marketing_plans`: GTM strategies, social captions, and 4-week calendars.
- `financial_calculations`: Inputs, outputs, and AI CFO explanations.
- `action_plans`: Sprint milestones with priority, target date, and success metrics.
- `saved_resources`: Central index for the Knowledge Library.
- `research_notes`: Market landscape notes with competitor analysis and field checklists.

---

## 🌐 Deploying to Production (Vercel & Supabase)

### 1. Database (Supabase PostgreSQL)
1. Create a new Supabase project.
2. In Supabase Project Settings -> Database, copy the Connection String (`Transaction` or `Session` pooler).
3. In `prisma/schema.prisma`, change datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run `npx prisma db push` or execute `prisma/migrations/01_postgresql_init/migration.sql` in the Supabase SQL Editor.

### 2. Hosting (Vercel)
1. Push repository to GitHub.
2. Import project into Vercel.
3. Configure Environment Variables in Vercel Dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_DEFAULT_CURRENCY`
4. Deploy!
