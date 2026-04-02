<div align="center">

```
███████╗██╗███╗   ██╗████████╗██████╗  █████╗  ██████╗██╗  ██╗    ██╗   ██╗██████╗ 
██╔════╝██║████╗  ██║╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝    ██║   ██║╚════██╗
█████╗  ██║██╔██╗ ██║   ██║   ██████╔╝███████║██║     █████╔╝     ██║   ██║ █████╔╝
██╔══╝  ██║██║╚██╗██║   ██║   ██╔══██╗██╔══██║██║     ██╔═██╗     ╚██╗ ██╔╝██╔═══╝ 
██║     ██║██║ ╚████║   ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗     ╚████╔╝ ███████╗
╚═╝     ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝      ╚═══╝  ╚══════╝
```

### *Your Financial Intelligence Command Center*

<br/>

[![License](https://img.shields.io/badge/License-MIT-0DDC9B?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js_16-App_Router-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS_11-Fastify-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-Prisma_ORM-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-AI_Copilot-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-6C74FF?style=flat-square)](CONTRIBUTING.md)

<br/>

> **FinTrack V2** is not another expense tracker.  
> It is a precision-engineered, AI-native wealth intelligence platform — purpose-built for users who demand real answers about their financial future, not just pie charts.

<br/>

[**Explore Features**](#-features) · [**Quick Start**](#-quick-start) · [**Architecture**](#-architecture) · [**AI Copilot**](#-ai-wealth-copilot) 

---

</div>

<br/>

## ◆ What Makes FinTrack V2 Different

Most finance apps record the past. **FinTrack V2 models the future.**

| Dimension | Traditional Apps | FinTrack V2 |
|:---|:---:|:---:|
| Data scope | Transactions only | Stocks · MF · Crypto · Liabilities · Insurance |
| Portfolio pricing | Manual entry | Live: Yahoo Finance + CoinGecko + MFAPI |
| AI capability | None | Gemini 2.5 Flash with full financial snapshot RAG |
| Forecasting | None | 12-month income/expense projection engine |
| Anomaly detection | None | Category-level spend anomaly alerts |
| Numeric precision | Float (lossy) | Integer cents / BigInt — zero rounding error |
| Privacy | None | One-click masking of all sensitive values |

<br/>

---

## ◈ Features

<details open>
<summary><strong>&nbsp;🧠 &nbsp;AI Wealth Copilot — Neural Financial Intelligence</strong></summary>
<br/>

The Copilot is the crown jewel of FinTrack V2. It is a **real-time, context-aware financial advisor** powered by Gemini 2.5 Flash with a custom Retrieval-Augmented Generation (RAG) pipeline.

Every query is grounded in a live **full financial snapshot** built fresh from the database — net worth, cash flow, investments, liabilities, insurance, and goals — expressed in INR before being passed to the model.

**Dual Persona Intelligence**

```
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│         CA MODE  🛡️              │   │         CFA MODE  📈             │
│  Chartered Accountant persona   │   │  Chartered Financial Analyst     │
│                                 │   │  persona                         │
│  · Budget defense & warnings    │   │  · Portfolio optimization        │
│  · Overspending anomaly alerts  │   │  · Wealth growth strategies      │
│  · Tax & liability guidance     │   │  · Goal projection & planning    │
│  · Daily money management       │   │  · Investment rebalancing        │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

- **Voice + Text input** — Web Speech API for hands-free querying
- **Live TTS output** — Premium English voice synthesis with mute toggle
- **Proactive greeting** — Context-aware welcome message on page load
- **Suggestion chips** — Pre-built queries to surface insights instantly

</details>

<details>
<summary><strong>&nbsp;📊 &nbsp;Unified Wealth Dashboard</strong></summary>
<br/>

The dashboard is built on a **single aggregated read model** — one API call returns every financial dimension, computed in parallel server-side.

- **Net Worth Engine** — Real-time aggregation: `(MF current value + Stock current value + Manual assets) − Liabilities`
- **Financial Freedom Gauge** — Visual progress bar tracking total principal repayment across all loans
- **Portfolio TreeMap** — Cell-size-proportional heatmap of all holdings, color-coded by P&L percentage
- **12-Month Forecast** — Client-side projection engine extrapolated from all available transaction history
- **Month-over-Month** — 6-month bar chart comparing income, expenses, and net savings
- **Smart Insights** — AI-ranked alerts for budget overruns, spending anomalies, and savings achievements
- **KPI Strip** — Real-time: income, expenses, savings rate, budget utilization, transaction count
- **Privacy Mode** — One-click masking of all ₹ values across the entire dashboard

</details>

<details>
<summary><strong>&nbsp;💼 &nbsp;Wealth & Investment Management</strong></summary>
<br/>

**Mutual Funds**
- Search via MFAPI.in — 15,000+ schemes
- Lumpsum and SIP holding modes
- Live NAV pricing with daily auto-refresh via cron worker
- Historical NAV chart: 1Y / 3Y / 5Y periods
- SIP installment count auto-calculated from start date

**Stocks & Crypto**
- NSE (India), US equities, and cryptocurrency support
- Yahoo Finance 15-minute delayed pricing
- CoinGecko real-time crypto pricing
- Frankfurter API for live USD → INR conversion
- Per-holding P&L in ₹ regardless of origin currency

**Manual Assets**
- Property, Fixed Deposits, Gold, Vehicles, and more
- Custom value entry for non-market assets

**Allocation View**
- Interactive donut chart across: Mutual Funds · Stocks · Manual Assets
- Top 5 performers and laggards ranked by P&L%

</details>

<details>
<summary><strong>&nbsp;🛡️ &nbsp;Insurance — HLV Protection Analysis</strong></summary>
<br/>

FinTrack V2 goes far beyond policy storage. It performs a **Human Life Value (HLV) analysis** to quantify whether your current coverage is actually sufficient.

```
Required Coverage = (Annual Budget × 20) + Total Liabilities − Liquid Investments
Coverage Gap      = Required Coverage − Sum of Term Life policies
```

- Policy types: Term Life · Health · Motor · Home
- Urgency-aware UI: overdue renewals glow red, ≤30 days amber, upcoming ghost
- **Pay Premium** button: records transaction + auto-advances next due date
- Daily cron worker fires expiry alerts 7 days before renewal
- Animated coverage gap visualization with real gap amount

</details>

<details>
<summary><strong>&nbsp;💳 &nbsp;Transactions & Smart Budgets</strong></summary>
<br/>

- Full CRUD transaction engine with category, merchant, date, and note
- Real-time budget progress bars per category
- **Anomaly detection**: flags categories spending >50% above last month
- **Budget alerts**: warning at 80%, exceeded at 100%
- Savings rate tracking with achievement/warning thresholds
- Category breakdown with 3-month spending trend analysis

</details>

<details>
<summary><strong>&nbsp;🎯 &nbsp;Goals & Liabilities</strong></summary>
<br/>

**Goals**
- Financial milestone tracking (Emergency Fund, Travel, Equipment, Investment)
- Target amount, current progress, deadline, and monthly contribution needed
- Animated circular progress indicators

**Liabilities**
- Multi-category loan tracking: Home · Car · Personal · Education · Credit Card
- Debt-to-Asset ratio gauge with safe/caution/high-risk zones
- Per-loan repayment progress visualization
- Sorted by interest rate to surface highest-cost debt first
- Financial Freedom % — unified metric across all loans

</details>

<br/>

---

## ◈ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT  (Next.js 16)                            │
│                                                                         │
│   App Router  ·  React 19  ·  Tailwind CSS v4  ·  Framer Motion        │
│   Zustand (global state)  ·  TanStack Query (server state + caching)   │
│   Web Speech API  ·  Recharts  ·  Space Mono typography                │
└────────────────────────────┬────────────────────────────────────────────┘
                             │  HTTPS  ·  JWT Bearer
┌────────────────────────────▼────────────────────────────────────────────┐
│                        API GATEWAY  (NestJS 11 / Fastify)               │
│                                                                         │
│   ZodValidationPipe  ·  TransformInterceptor  ·  AllExceptionsFilter   │
│   JwtAuthGuard  ·  @CurrentUser decorator  ·  Swagger / OpenAPI        │
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  Auth        │ │  Wealth      │ │  Dashboard   │ │  Copilot     │  │
│  │  Module      │ │  Module      │ │  Module      │ │  Module      │  │
│  └──────────────┘ └──────┬───────┘ └──────────────┘ └──────────────┘  │
│                          │ delegates                                    │
│  ┌──────────────┐ ┌──────▼───────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  Transactions│ │  MutualFunds │ │  Stocks      │ │  Insurance   │  │
│  │  Module      │ │  Service     │ │  Service     │ │  Module      │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    BACKGROUND WORKERS (Cron)                    │   │
│  │  PriceWorker (every 4h)  ·  SnapshotWorker (1st of month)      │   │
│  │  InsuranceWorker (daily 9 AM)                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────────┘
                             │  Prisma ORM  ·  PrismaPg adapter
┌────────────────────────────▼────────────────────────────────────────────┐
│                       PostgreSQL 16 (Data Layer)                        │
│                                                                         │
│  Integer cents (Int/BigInt) — zero floating-point precision loss        │
│  Models: User · Transaction · Budget · Asset · Liability · Goal        │
│          MutualFundHolding · StockHolding · Insurance · Snapshot       │
└─────────────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────────┐
│                       EXTERNAL APIs                                     │
│                                                                         │
│   Yahoo Finance     →  NSE + US stock pricing (15-min delayed)         │
│   CoinGecko         →  Cryptocurrency real-time pricing                │
│   MFAPI.in          →  15,000+ Indian mutual fund NAVs                 │
│   Frankfurter       →  USD → INR exchange rate (ECB data)              │
│   Google Gemini 2.5 →  AI Wealth Copilot language model                │
└─────────────────────────────────────────────────────────────────────────┘
```

<br/>

### Design Principles

| Principle | Implementation |
|:---|:---|
| **Precision Accounting** | All monetary values stored as integer cents (`Int`) or `BigInt`. No `Float` for money. |
| **Read-Model Aggregator** | `WealthService` delegates to `MutualFundsService` and `StocksService` — never queries their tables directly |
| **Client-Side Charts** | Forecast and MoM charts computed from `useTransactions()` — eliminates stale backend projection bugs |
| **Never-masked Axes** | Chart `tickFormatter` functions are axis-safe: no privacy mask, always return real ₹ values |
| **Typed Catch Blocks** | `.catch((): Liability[] => [])` — prevents TypeScript inferring `never[]` on Promise fallbacks |
| **Callback Hooks** | Speech controller uses `onReply` callback ref pattern — no `useState` + `useEffect` stale closure chains |

<br/>

---

## ◈ Tech Stack

<table>
<thead>
<tr><th>Layer</th><th>Technology</th><th>Version</th><th>Purpose</th></tr>
</thead>
<tbody>
<tr><td rowspan="7"><strong>Frontend</strong></td><td>Next.js</td><td>16</td><td>App Router, SSR, file-based routing</td></tr>
<tr><td>React</td><td>19</td><td>UI composition, concurrent features</td></tr>
<tr><td>TypeScript</td><td>5.0</td><td>Full type safety across the stack</td></tr>
<tr><td>Tailwind CSS</td><td>v4</td><td>Utility-first styling</td></tr>
<tr><td>Framer Motion</td><td>latest</td><td>Animation & micro-interactions</td></tr>
<tr><td>Zustand</td><td>latest</td><td>Global state (privacy mode, sidebar)</td></tr>
<tr><td>TanStack Query</td><td>v5</td><td>Server state caching & invalidation</td></tr>
<tr><td rowspan="5"><strong>Backend</strong></td><td>NestJS</td><td>11</td><td>Modular TypeScript API framework</td></tr>
<tr><td>Fastify</td><td>latest</td><td>High-performance HTTP adapter</td></tr>
<tr><td>nestjs-zod</td><td>latest</td><td>DTO validation with Zod schemas</td></tr>
<tr><td>@nestjs/schedule</td><td>latest</td><td>Cron-based background workers</td></tr>
<tr><td>Swagger / OpenAPI</td><td>latest</td><td>Auto-generated API documentation</td></tr>
<tr><td rowspan="3"><strong>Database</strong></td><td>PostgreSQL</td><td>16</td><td>Primary relational data store</td></tr>
<tr><td>Prisma ORM</td><td>7.5</td><td>Type-safe database client</td></tr>
<tr><td>PrismaPg</td><td>latest</td><td>Native pg adapter for connection pooling</td></tr>
<tr><td rowspan="5"><strong>External APIs</strong></td><td>Google Gemini</td><td>2.5 Flash</td><td>AI Wealth Copilot language model</td></tr>
<tr><td>Yahoo Finance</td><td>v8 chart API</td><td>NSE & US equity pricing</td></tr>
<tr><td>CoinGecko</td><td>v3</td><td>Cryptocurrency pricing</td></tr>
<tr><td>MFAPI.in</td><td>—</td><td>Indian mutual fund NAV data</td></tr>
<tr><td>Frankfurter</td><td>—</td><td>ECB-backed forex rates</td></tr>
<tr><td rowspan="3"><strong>Security</strong></td><td>JWT</td><td>@nestjs/jwt</td><td>Stateless authentication</td></tr>
<tr><td>bcrypt</td><td>latest</td><td>Password hashing</td></tr>
<tr><td>@fastify/cors</td><td>latest</td><td>Origin-restricted CORS policy</td></tr>
</tbody>
</table>

<br/>

---

## ◈ Quick Start

### Prerequisites

```
Node.js  ≥ 20.0
PostgreSQL ≥ 14
npm / pnpm / yarn
Google Gemini API key  (https://ai.google.dev/)
```

### 1 — Clone

```bash
git clone https://github.com/Satwik290/FinTrack.git
cd FinTrack
```

### 2 — Backend

```bash
cd server/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fintrack_v2"
GEMINI_API_KEY="your_gemini_api_key_here"
JWT_SECRET="your_super_secret_jwt_key"
```

```bash
# Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start development server (port 3001)
npm run start:dev
```

### 3 — Frontend

```bash
cd ../../client

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

```bash
# Start development server (port 3000)
npm run dev
```

### 4 — Access

| Service | URL |
|:---|:---|
| Application | http://localhost:3000 |
| API (Swagger) | http://localhost:3001/api/docs |
| Health check | http://localhost:3001/api |

<br/>

---

## ◈ Project Structure

```
FinTrack/
│
├── client/                          # Next.js 16 Frontend
│   └── src/
│       ├── app/
│       │   ├── (auth)/              # Login · Signup
│       │   └── (app)/
│       │       ├── dashboard/       # Wealth dashboard + forecast charts
│       │       ├── wealth/          # Tabs: Overview · Stocks · MF · Assets · Liabilities · Insurance
│       │       ├── transactions/    # Full CRUD transaction engine
│       │       ├── budget/          # Monthly category budget tracking
│       │       ├── goals/           # Financial milestone tracking
│       │       ├── insights/        # AI-generated spending insights
│       │       └── copilot/         # AI Wealth Copilot (voice + text)
│       ├── hooks/                   # useTransactions · useWealth · useDashboard · ...
│       └── store/                   # Zustand: useAppStore · useWealthStore
│
└── server/backend/                  # NestJS 11 API
    └── src/
        ├── modules/
        │   ├── auth/                # JWT signup · login
        │   ├── wealth/              # Aggregator: assets · liabilities · full summary
        │   │   └── workers/         # PriceWorker · SnapshotWorker
        │   ├── mutual-funds/        # MFAPI integration · SIP · lumpsum
        │   ├── stocks/              # Yahoo Finance · CoinGecko · multi-exchange
        │   ├── insurance/           # HLV analysis · policy CRUD · premium payments
        │   │   └── workers/         # InsuranceWorker (expiry alerts)
        │   ├── dashboard/           # Forecast · insights · MoM comparisons
        │   ├── copilot/             # Gemini RAG pipeline · snapshot builder
        │   ├── transactions/        # Transaction CRUD
        │   ├── budgets/             # Budget CRUD + real-time spend calculation
        │   ├── goals/               # Goal CRUD
        │   └── shared/              # MarketDataService · ExchangeRateService (global)
        └── prisma/                  # PrismaService (pg adapter)
```

<br/>

---

## ◈ API Reference

The full API is documented via Swagger at `/api/docs` when the server is running.

### Core Endpoints

```
Auth
  POST   /api/auth/signup          Register new user
  POST   /api/auth/login           Obtain JWT token

Wealth (requires JWT)
  GET    /api/wealth/summary       Full aggregated wealth snapshot
  POST   /api/wealth/assets        Add manual asset
  DELETE /api/wealth/assets/:id    Remove asset
  POST   /api/wealth/liabilities   Add liability
  DELETE /api/wealth/liabilities/:id

Investments (requires JWT)
  GET    /api/mutual-funds/portfolio
  POST   /api/mutual-funds/holdings/lumpsum
  POST   /api/mutual-funds/holdings/sip
  GET    /api/mutual-funds/history/:schemeCode?period=1Y

  GET    /api/stocks/portfolio
  POST   /api/stocks/holdings
  GET    /api/stocks/search?q=TCS&exchange=NSE

Insurance (requires JWT)
  GET    /api/insurance
  POST   /api/insurance
  DELETE /api/insurance/:id
  POST   /api/insurance/:id/pay    Pay premium + advance due date

Dashboard (requires JWT)
  GET    /api/dashboard/forecast   12-month income/expense projection
  GET    /api/dashboard/insights   AI-ranked anomaly + achievement alerts
  GET    /api/dashboard/comparisons  6-month MoM breakdown

Copilot (requires JWT)
  POST   /api/copilot/chat         Send query, receive AI response
  GET    /api/copilot/greeting     Proactive on-load financial summary
```

<br/>

---

## ◈ Background Workers

Three autonomous cron workers run server-side without user intervention:

```
┌─────────────────┬──────────────────────────┬────────────────────────────────────┐
│ Worker          │ Schedule                 │ Action                             │
├─────────────────┼──────────────────────────┼────────────────────────────────────┤
│ PriceWorker     │ Every 4 hours            │ Refreshes all MF NAVs + stock      │
│                 │                          │ prices across all users            │
├─────────────────┼──────────────────────────┼────────────────────────────────────┤
│ SnapshotWorker  │ 1st of every month 00:00 │ Archives net worth snapshot for    │
│                 │                          │ every user for historical charts   │
├─────────────────┼──────────────────────────┼────────────────────────────────────┤
│ InsuranceWorker │ Daily at 9:00 AM         │ Scans policies expiring within 7   │
│                 │                          │ days and logs urgency warnings     │
└─────────────────┴──────────────────────────┴────────────────────────────────────┘
```

<br/>

---

## ◈ Data Precision Architecture

FinTrack V2 treats monetary precision as a **non-negotiable hard requirement**, not a suggestion.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  RULE: No Float for Money                                               │
│                                                                         │
│  Float(100.1 + 200.2) = 300.3000000000000x  ← unacceptable             │
│  Int(10010 + 20020)   = 30030               ← exact, always            │
│                                                                         │
│  All storage: Int (cents) or BigInt (large coverage amounts)           │
│  All display: divide by 100, format with Intl.NumberFormat en-IN       │
│  No rounding at the DB layer — only at the presentation layer          │
└─────────────────────────────────────────────────────────────────────────┘
```

| Column | Type | Example |
|:---|:---:|:---|
| `Asset.currentValueInCents` | `Int` | `500000` = ₹5,000 |
| `Liability.remainingBalanceInCents` | `Int` | `15000000` = ₹1,50,000 |
| `Insurance.sumInsured` | `BigInt` | `100000000` = ₹10,00,000 coverage |
| `Insurance.premiumAmount` | `BigInt` | `1200000` = ₹12,000 premium |
| `Transaction.amount` | `Float` | Exception — daily cash amounts are small, display-safe |

<br/>

---

## ◈ Design System

FinTrack V2 uses a **"Calm Tech" design language** — dark, precise, and deliberately restrained. Colors communicate meaning, not decoration.

```
Background Canvas    #0F121C   ← near-black, zero eye-strain
Surface              #161B29   ← elevated cards
Text Primary         #E5EAF0   ← warm white
Text Muted           #4A5568   ← contextual metadata

Gain (profit/income) #0DDC9B   ← jade green  — NOT standard green
Loss (expense/debt)  #FF5C67   ← terracotta  — NOT standard red
Accent               #6C74FF   ← indigo
Secondary Accent     #7E5BFB   ← deep violet

Monetary values      Space Mono / JetBrains Mono  ← tabular figures
```

> **Why jade and terracotta instead of green and red?**  
> Standard red/green triggers anxiety and loss aversion. The custom palette communicates status clearly while keeping the interface emotionally neutral — important when users are viewing debt and portfolio loss data.

<br/>


## ◈ Roadmap

- [ ] **Redis caching** — Cache wealth summary with 5-minute TTL to reduce DB load on concurrent users  
- [ ] **Goal contributions** — Direct transaction linkage to goal progress tracking  
- [ ] **Export to PDF** — One-click financial summary report generation  
- [ ] **Email notifications** — Budget breach and insurance renewal alerts via SMTP  
- [ ] **Multi-currency** — Support for USD, EUR, GBP portfolios with live conversion  
- [ ] **Mobile PWA** — Offline-capable progressive web app with service worker  
- [ ] **2FA / TOTP** — TOTP-based two-factor authentication  
- [ ] **Shared portfolios** — Read-only sharing link for advisor/accountant access  

<br/>

---

## ◈ Contributing

Contributions are welcome. Please read the [Contributing Guide](CONTRIBUTING.md) before opening a PR.

```bash
# Fork → Clone → Branch
git checkout -b feature/your-feature-name

# Make changes, then
npm run lint && npm run test

# Commit with conventional commits
git commit -m "feat(copilot): add streaming response support"

# Push and open a PR
git push origin feature/your-feature-name
```

<br/>

---

<div align="center">

---

**FinTrack V2** — *Precision. Intelligence. Financial Freedom.*



---

</div>
