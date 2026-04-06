const COMPANY = {
  id: "strategy",
  name: "Strategy",
  ticker: "MSTR",
  stockSymbol: "MSTR",
  companyLabel: "Strategy (NASDAQ: MSTR)",
  marketCurrency: "USD",
  btcHoldings: 762099,
  dilutedSharesOutstanding: 377847000,
  snapshotDate: "2026-03-22",
  holdingsSource: "https://www.strategy.com/shares",
  stockSource: "https://finance.yahoo.com/quote/MSTR/",
  color: "#0f7b6c"
};

const YAHOO_CHART_URL =
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    COMPANY.stockSymbol
  )}?range=5y&interval=1d&includePrePost=false&events=div%2Csplits`;
const BTC_YAHOO_CHART_URL =
  "https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?range=5y&interval=1d&includePrePost=false&events=div%2Csplits";

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "hw2-robot-advisor/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function dedupeByDate(rows, key) {
  return rows
    .filter((row, index, allRows) => index === 0 || row.date !== allRows[index - 1].date)
    .filter((row) => row[key] !== null && row[key] !== undefined && !Number.isNaN(row[key]));
}

async function fetchBtcSeries() {
  const payload = await fetchJson(BTC_YAHOO_CHART_URL);
  const result = payload.chart?.result?.[0];

  if (!result) {
    throw new Error("No chart result for BTC-USD");
  }

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];

  return dedupeByDate(
    timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      btcPrice:
        closes[index] === null || closes[index] === undefined ? null : round(closes[index], 2)
    })),
    "btcPrice"
  );
}

async function fetchStockSeries() {
  const payload = await fetchJson(YAHOO_CHART_URL);
  const result = payload.chart?.result?.[0];

  if (!result) {
    throw new Error(`No chart result for ${COMPANY.stockSymbol}`);
  }

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];

  return dedupeByDate(
    timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      stockPrice:
        closes[index] === null || closes[index] === undefined ? null : round(closes[index], 2)
    })),
    "stockPrice"
  );
}

function buildPriceMap(series, key) {
  return series.reduce((map, row) => {
    map[row.date] = row[key];
    return map;
  }, {});
}

function buildSeries(stockSeries, btcPriceMap) {
  return stockSeries
    .map((stockPoint) => {
      const btcPrice = btcPriceMap[stockPoint.date];

      if (!btcPrice) {
        return null;
      }

      const navPerShare = (btcPrice * COMPANY.btcHoldings) / COMPANY.dilutedSharesOutstanding;
      const mnav = stockPoint.stockPrice / navPerShare;

      return {
        date: stockPoint.date,
        stockPrice: stockPoint.stockPrice,
        btcPrice: round(btcPrice, 2),
        navPerShare: round(navPerShare, 2),
        mnav: round(mnav, 4)
      };
    })
    .filter(Boolean);
}

function summarizeSeries(series) {
  const latest = series.at(-1);
  const weekAgo = series.at(Math.max(0, series.length - 8));
  const monthAgo = series.at(Math.max(0, series.length - 31));
  const latestPremiumToNavPct = round((latest.mnav - 1) * 100, 2);
  const latestDiscountToNavPct = round((1 - latest.mnav) * 100, 2);
  const latestMarketCap = round(
    (latest.stockPrice * COMPANY.dilutedSharesOutstanding) / 1000000000,
    2
  );

  const weeklyChangePct = weekAgo
    ? round(((latest.mnav / weekAgo.mnav) - 1) * 100, 2)
    : null;
  const monthlyChangePct = monthAgo
    ? round(((latest.mnav / monthAgo.mnav) - 1) * 100, 2)
    : null;
  const stockWeeklyChangePct = weekAgo
    ? round(((latest.stockPrice / weekAgo.stockPrice) - 1) * 100, 2)
    : null;
  const stockMonthlyChangePct = monthAgo
    ? round(((latest.stockPrice / monthAgo.stockPrice) - 1) * 100, 2)
    : null;
  const btcWeeklyChangePct = weekAgo
    ? round(((latest.btcPrice / weekAgo.btcPrice) - 1) * 100, 2)
    : null;
  const btcMonthlyChangePct = monthAgo
    ? round(((latest.btcPrice / monthAgo.btcPrice) - 1) * 100, 2)
    : null;
  const navWeeklyChangePct = weekAgo
    ? round(((latest.navPerShare / weekAgo.navPerShare) - 1) * 100, 2)
    : null;
  const navMonthlyChangePct = monthAgo
    ? round(((latest.navPerShare / monthAgo.navPerShare) - 1) * 100, 2)
    : null;
  const discountWeeklyChangePct = weekAgo
    ? round(
        ((1 - latest.mnav) * 100) - ((1 - weekAgo.mnav) * 100),
        2
      )
    : null;
  const discountMonthlyChangePct = monthAgo
    ? round(
        ((1 - latest.mnav) * 100) - ((1 - monthAgo.mnav) * 100),
        2
      )
    : null;

  return {
    latestDate: latest.date,
    latestMnav: latest.mnav,
    latestStockPrice: latest.stockPrice,
    latestBtcPrice: latest.btcPrice,
    latestNavPerShare: latest.navPerShare,
    latestPremiumToNavPct,
    latestDiscountToNavPct,
    latestMarketCapBillions: latestMarketCap,
    weeklyChangePct,
    monthlyChangePct,
    stockWeeklyChangePct,
    stockMonthlyChangePct,
    btcWeeklyChangePct,
    btcMonthlyChangePct,
    navWeeklyChangePct,
    navMonthlyChangePct,
    discountWeeklyChangePct,
    discountMonthlyChangePct,
    mnavLow: Math.min(...series.map((point) => point.mnav)),
    mnavHigh: Math.max(...series.map((point) => point.mnav)),
    periodStartDate: series[0].date
  };
}

function buildRuleBasedSummary(summary) {
  const relativeNavText =
    summary.latestPremiumToNavPct > 0
      ? `目前股價較每股 BTC NAV 溢價 ${summary.latestPremiumToNavPct}%`
      : `目前股價較每股 BTC NAV 折價 ${summary.latestDiscountToNavPct}%`;
  const weeklyDirection =
    summary.weeklyChangePct === null
      ? "近一週變化資料不足"
      : summary.weeklyChangePct >= 0
        ? `近一週 mNAV 上升 ${summary.weeklyChangePct}%`
        : `近一週 mNAV 下跌 ${Math.abs(summary.weeklyChangePct)}%`;
  const monthlyDirection =
    summary.monthlyChangePct === null
      ? "近一月變化資料不足"
      : summary.monthlyChangePct >= 0
        ? `近一月 mNAV 上升 ${summary.monthlyChangePct}%`
        : `近一月 mNAV 下跌 ${Math.abs(summary.monthlyChangePct)}%`;

  return `${summary.latestDate} 最新資料顯示，Strategy 的 mNAV 為 ${summary.latestMnav}，${relativeNavText}。${weeklyDirection}，${monthlyDirection}。`;
}

async function getIndicatorData() {
  const [btcSeries, stockSeries] = await Promise.all([fetchBtcSeries(), fetchStockSeries()]);
  const btcPriceMap = buildPriceMap(btcSeries, "btcPrice");
  const series = buildSeries(stockSeries, btcPriceMap);
  const summary = summarizeSeries(series);

  return {
    metadata: {
      company: COMPANY,
      indicatorName: "mNAV",
      formula: "mNAV = Stock Price / BTC NAV per Share",
      navFormula: "BTC NAV per Share = BTC Price x BTC Holdings / Diluted Shares Outstanding",
      priceSources: {
        btc: "https://finance.yahoo.com/quote/BTC-USD/",
        stock: "https://finance.yahoo.com/"
      },
      generatedAt: new Date().toISOString()
    },
    summary,
    aiSummary: buildRuleBasedSummary(summary),
    series
  };
}

module.exports = {
  getIndicatorData
};
