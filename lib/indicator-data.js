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

const STOCK_DAILY_URL =
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    COMPANY.stockSymbol
  )}?range=5y&interval=1d&includePrePost=false&events=div%2Csplits`;
const BTC_DAILY_URL =
  "https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?range=5y&interval=1d&includePrePost=false&events=div%2Csplits";
const STOCK_INTRADAY_URL =
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    COMPANY.stockSymbol
  )}?range=1d&interval=5m&includePrePost=false&events=div%2Csplits`;
const BTC_INTRADAY_URL =
  "https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?range=1d&interval=5m&includePrePost=false&events=div%2Csplits";

const marketTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

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

function formatMarketTimestamp(timestampMs) {
  const parts = marketTimeFormatter.formatToParts(new Date(timestampMs));
  const values = parts.reduce((accumulator, part) => {
    if (part.type !== "literal") {
      accumulator[part.type] = part.value;
    }
    return accumulator;
  }, {});

  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute} ET`;
}

function dedupeRows(rows, identityKey, valueKey) {
  return rows
    .filter((row, index, allRows) => index === 0 || row[identityKey] !== allRows[index - 1][identityKey])
    .filter((row) => row[valueKey] !== null && row[valueKey] !== undefined && !Number.isNaN(row[valueKey]));
}

function extractChartRows(payload, symbol) {
  const result = payload.chart?.result?.[0];

  if (!result) {
    throw new Error(`No chart result for ${symbol}`);
  }

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];

  return timestamps.map((timestamp, index) => ({
    timestampMs: timestamp * 1000,
    close: closes[index]
  }));
}

async function fetchDailySeries(url, valueKey, symbol) {
  const payload = await fetchJson(url);
  const rows = extractChartRows(payload, symbol);

  return dedupeRows(
    rows.map((row) => ({
      date: new Date(row.timestampMs).toISOString().slice(0, 10),
      [valueKey]: row.close === null || row.close === undefined ? null : round(row.close, 2)
    })),
    "date",
    valueKey
  );
}

async function fetchIntradaySeries(url, valueKey, symbol) {
  const payload = await fetchJson(url);
  const rows = extractChartRows(payload, symbol);

  return dedupeRows(
    rows.map((row) => ({
      timestampMs: row.timestampMs,
      timestamp: new Date(row.timestampMs).toISOString(),
      displayDate: formatMarketTimestamp(row.timestampMs),
      [valueKey]: row.close === null || row.close === undefined ? null : round(row.close, 2)
    })),
    "timestamp",
    valueKey
  );
}

function buildValueMap(series, keyField, valueField) {
  return series.reduce((map, row) => {
    map[row[keyField]] = row[valueField];
    return map;
  }, {});
}

function buildSeries(stockSeries, btcPriceMap, matchKey) {
  return stockSeries
    .map((stockPoint) => {
      const btcPrice = btcPriceMap[stockPoint[matchKey]];

      if (!btcPrice) {
        return null;
      }

      const navPerShare = (btcPrice * COMPANY.btcHoldings) / COMPANY.dilutedSharesOutstanding;
      const mnav = stockPoint.stockPrice / navPerShare;

      return {
        date: stockPoint.date,
        timestamp: stockPoint.timestamp || null,
        timestampMs: stockPoint.timestampMs || null,
        displayDate: stockPoint.displayDate || stockPoint.date,
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
    ? round((latest.mnav / weekAgo.mnav - 1) * 100, 2)
    : null;
  const monthlyChangePct = monthAgo
    ? round((latest.mnav / monthAgo.mnav - 1) * 100, 2)
    : null;
  const stockWeeklyChangePct = weekAgo
    ? round((latest.stockPrice / weekAgo.stockPrice - 1) * 100, 2)
    : null;
  const stockMonthlyChangePct = monthAgo
    ? round((latest.stockPrice / monthAgo.stockPrice - 1) * 100, 2)
    : null;
  const btcWeeklyChangePct = weekAgo
    ? round((latest.btcPrice / weekAgo.btcPrice - 1) * 100, 2)
    : null;
  const btcMonthlyChangePct = monthAgo
    ? round((latest.btcPrice / monthAgo.btcPrice - 1) * 100, 2)
    : null;
  const navWeeklyChangePct = weekAgo
    ? round((latest.navPerShare / weekAgo.navPerShare - 1) * 100, 2)
    : null;
  const navMonthlyChangePct = monthAgo
    ? round((latest.navPerShare / monthAgo.navPerShare - 1) * 100, 2)
    : null;
  const discountWeeklyChangePct = weekAgo
    ? round((1 - latest.mnav) * 100 - (1 - weekAgo.mnav) * 100, 2)
    : null;
  const discountMonthlyChangePct = monthAgo
    ? round((1 - latest.mnav) * 100 - (1 - monthAgo.mnav) * 100, 2)
    : null;

  return {
    latestDate: latest.date,
    latestDisplayDate: latest.displayDate || latest.date,
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

function mergeLatestPointIntoSummary(summary, latestPoint) {
  if (!latestPoint) {
    return summary;
  }

  return {
    ...summary,
    latestDate: latestPoint.displayDate || latestPoint.date,
    latestDisplayDate: latestPoint.displayDate || latestPoint.date,
    latestMnav: latestPoint.mnav,
    latestStockPrice: latestPoint.stockPrice,
    latestBtcPrice: latestPoint.btcPrice,
    latestNavPerShare: latestPoint.navPerShare,
    latestPremiumToNavPct: round((latestPoint.mnav - 1) * 100, 2),
    latestDiscountToNavPct: round((1 - latestPoint.mnav) * 100, 2),
    latestMarketCapBillions: round(
      (latestPoint.stockPrice * COMPANY.dilutedSharesOutstanding) / 1000000000,
      2
    )
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
  const [btcDailySeries, stockDailySeries, btcIntradaySeries, stockIntradaySeries] =
    await Promise.all([
      fetchDailySeries(BTC_DAILY_URL, "btcPrice", "BTC-USD"),
      fetchDailySeries(STOCK_DAILY_URL, "stockPrice", COMPANY.stockSymbol),
      fetchIntradaySeries(BTC_INTRADAY_URL, "btcPrice", "BTC-USD"),
      fetchIntradaySeries(STOCK_INTRADAY_URL, "stockPrice", COMPANY.stockSymbol)
    ]);

  const dailyBtcPriceMap = buildValueMap(btcDailySeries, "date", "btcPrice");
  const intradayBtcPriceMap = buildValueMap(btcIntradaySeries, "timestamp", "btcPrice");

  const dailySeries = buildSeries(stockDailySeries, dailyBtcPriceMap, "date");
  const intradaySeries = buildSeries(stockIntradaySeries, intradayBtcPriceMap, "timestamp");

  const baseSummary = summarizeSeries(dailySeries);
  const summary = mergeLatestPointIntoSummary(baseSummary, intradaySeries.at(-1));

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
      intradayInterval: "5m",
      generatedAt: new Date().toISOString()
    },
    summary,
    aiSummary: buildRuleBasedSummary(summary),
    series: dailySeries,
    intradaySeries
  };
}

module.exports = {
  getIndicatorData
};
