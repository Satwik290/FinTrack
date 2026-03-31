# Software Requirements Specification (SRS)

## 1. System Overview
FinTrack V2 utilizes a decoupled client-server architecture ensuring high performance, precision, and state-of-the-art security.

## 2. Client Architecture (Frontend)
* **Framework:** Next.js 16 (App Router) + React 19.
* **Styling & UI:** Tailwind CSS v4, Glassmorphism design system, custom SVG components (Arc Gauges).
* **State Management:** Zustand (global state) + TanStack/React Query (server state & caching).
* **Animation:** Framer Motion (page transitions, micro-interactions, 60fps rendering).
* **Key Modules:** 
  * `/(app)/dashboard`: Elite KPI strip, Net Worth aggregations.
  * `/(app)/wealth`: Asset lists, Liability Heatmaps.
  * `/(app)/budget`: Budget constraints and transaction histories.
  * `/(app)/insurance`: Tabbed interface for "Self-Driving" policy analysis.

## 3. Server Architecture (Backend)
* **Framework:** NestJS 11 (TypeScript, modular architecture).
* **Database & ORM:** PostgreSQL 16 + Prisma ORM 7.5.
* **Monetary Precision:** Implements `BigInt` equivalents (integer cents) for all financial storage to eliminate floating-point anomalies.
* **Data Validation:** Strict DTO validation via `nestjs-zod` and OpenAPI/Swagger integration.
* **Key Modules:**
  * `AuthModule`: Implements JWT strategy, `@CurrentUser` decorators, and endpoint guards.
  * `WealthModule` & `DashboardModule`: Aggregates cross-module metrics.
  * `StocksModule` / `MutualFundsModule`: Manages equities.
  * `InsuranceModule`: Handles policy DTOs and analytics mapping.
  * `TransactionsModule` / `BudgetsModule`: Expense parsing and limits.
  * `Cron/Workers`: Background schedulers for live price retrieval and periodic net-worth snapshotting.

## 4. Performance & Security Criteria
* **Execution Time:** Frontend initial loads < 1.5s; API response parsing under 200ms.
* **Data Protection:** JWT payload encryption, environment-based configuration, strict Zod payload stripping.
