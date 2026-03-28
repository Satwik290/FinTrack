-- CreateTable
CREATE TABLE "MutualFundHolding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schemeCode" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL,
    "fundHouse" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Equity',
    "units" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgNAV" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentNAV" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "investedAt" TEXT,
    "isSIP" BOOLEAN NOT NULL DEFAULT false,
    "sipAmount" DOUBLE PRECISION,
    "sipDay" INTEGER,
    "sipStartDate" TEXT,
    "totalSipInstallments" INTEGER NOT NULL DEFAULT 0,
    "navLastUpdated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MutualFundHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockHolding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "avgBuyPrice" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "priceLastUpdated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockHolding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MutualFundHolding" ADD CONSTRAINT "MutualFundHolding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHolding" ADD CONSTRAINT "StockHolding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
