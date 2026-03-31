# Product Requirements Document (PRD)

## 1. Vision & Strategy
**FinTrack V2** is an "Elite" financial command center transforming raw financial data into actionable wealth intelligence. It evolves standard expense tracking into a holistic wealth management platform featuring "Self-Driving" capabilities, live asset tracking, and comprehensive debt management.

## 2. Target Audience
* **High-Net-Worth Individuals & Investors:** Requiring live tracking of stocks, mutual funds, and complex assets.
* **Proactive Planners:** Users heavily focused on budgeting, debt reduction (liability heatmaps), and insurance coverage analysis.
* **Privacy-Conscious Users:** Demanding strict data protection (JWT security) and "Privacy Mode" UI masking.

## 3. Core System Requirements
* **Wealth Command Center:** Provide a unified view of Net Worth (Assets minus Liabilities) with visual analytics (SVG arc gauges, KPI strips).
* **Automated Asset Management ("Self-Driving"):** Background syncing of live stock/mutual fund prices and automated insurance policy tracking.
* **Day-to-Day Finances:** Robust transaction tracking and budget limit enforcement.
* **Flawless Accounting:** Zero precision loss via integer cent (BigInt) storage architecture.

## 4. Key Cross-Platform Flows
* **Onboarding & Auth:** Secure JWT-based login with a responsive, animated sliding-panel UI.
* **Investment Sync:** System automatically updates stock/mutual-fund valuations daily without user intervention.
* **Debt Visualization:** Liabilities are mapped across a color-coded heatmap based on interest rates to prioritize payoff.
