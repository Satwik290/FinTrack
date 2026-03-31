# FinTrack V2: Full System Features

## 1. Wealth & Asset Management
* **Universal Dashboard:** High-fidelity "Elite" UI displaying total Net Worth, aggregated Assets, and Liabilities with SVG arc gauges.
* **Liability Heatmap:** Visual representation of debt prioritizing high-interest liabilities across a dynamic color spectrum.
* **Real-Time Investment Sync:** Support for Stocks and Mutual Funds automatically updated via background pricing cron workers.
* **Financial Snapshots:** Automated archiving of periodic net worth values for historical growth charts.

## 2. Transactions & Budgets
* **Transaction Engine:** Add, categorize, and query day-to-day income and expenses accurately encoded in integer cents.
* **Budget Tracking:** Define monthly limits per category with real-time visual progress bars and warnings on the frontend.

## 3. "Self-Driving" Insurance Module
* **Smart Policy Tracker:** End-to-end interface for logging insurance policies (Health, Life, Vehicle) with automated expiry alerts.
* **Tabbed Analytics:** Dedicated dashboard views breaking down insurance coverage, premiums paid, and intelligent optimization insights.

## 4. UI/UX & Security Features
* **Glassmorphism Aesthetics:** Premium frosted-glass overlays, sleek dark-mode native themes, and vibrant accent colors (Tailwind v4).
* **Fluid Animations:** Animated auth sliding panels and spring-physics interactions using Framer Motion.
* **Privacy Mode:** Instant blurring/masking of sensitive financial integers for secure public viewing without disabling interaction.
* **Bulletproof Auth:** Fully guarded JWT backend endpoints shielding all modules natively.
