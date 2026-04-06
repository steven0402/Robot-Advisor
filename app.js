const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const integerFormatter = new Intl.NumberFormat("en-US");

const RANGE_LENGTHS = {
  "1D": 78,
  "1W": 5,
  "1M": 22,
  "3M": 66,
  "6M": 132,
  "1Y": 252,
  "2Y": 504,
  "5Y": 1260
};

const COPY = {
  "zh-Hant": {
    toggle: "EN",
    pageTitle: "Strategy mNAV 儀表板",
    heroCopy:
      "<strong>Strategy（MSTR）</strong> 的 mNAV、MSTR 股價、BTC 價格與每股 BTC NAV 即時概況。",
    heroFocusLabel: "觀察公司",
    heroFocusCaption: "最新 mNAV",
    gaugeKicker: "mNAV 指標",
    gaugeTitle: "目前估值位置",
    summaryKicker: "Gemini 摘要",
    summaryTitle: "即時重點",
    stockPriceLabel: "股價",
    navPerShareLabel: "每股 BTC NAV",
    marketCapLabel: "市值",
    relativeNavLabel: "相對 NAV",
    chartKicker: "時間序列",
    chartTitle: "mNAV、MSTR 股價與 BTC 價格",
    legendStock: "MSTR 股價",
    legendBtc: "BTC 價格",
    range: {
      "1D": "1日",
      "1W": "1週",
      "1M": "1個月",
      "3M": "3個月",
      "6M": "半年",
      "1Y": "1年",
      "2Y": "2年",
      "5Y": "5年"
    },
    trendKicker: "趨勢表格",
    trendTitle: "mNAV 趨勢表",
    treasuryBtcLabel: "持有 BTC",
    dilutedSharesLabel: "稀釋後股數",
    detailDateLabel: "最新交易日",
    tableHeadDate: "日期",
    tableHeadChange: "較前日變化",
    tableHeadStock: "MSTR 股價",
    tableHeadBtc: "BTC 價格",
    tableHeadMarketCap: "市值",
    tableFootnote: "每列顯示單日 mNAV 估值與前一交易日的變化，方便快速比較股價與 BTC 驅動。",
    errorKicker: "資料狀態",
    errorTitle: "暫時無法取得即時資料",
    loadingSummary: "載入摘要中...",
    loadingTrend: "載入趨勢資料中...",
    noTrend: "目前沒有可顯示的趨勢資料。",
    trendUnavailable: "趨勢資料暫時無法使用。",
    unavailable: "Unavailable",
    heroDate: (date) => `最新交易日 ${date}`,
    gaugePremium: (value) => `股價較每股 BTC NAV 溢價 ${value.toFixed(2)}%`,
    gaugeDiscount: (value) => `股價較每股 BTC NAV 折價 ${value.toFixed(2)}%`,
    gaugeFlat: "股價接近每股 BTC NAV",
    relativePremium: (value) => `溢價 ${value.toFixed(2)}%`,
    relativeDiscount: (value) => `折價 ${value.toFixed(2)}%`,
    treasuryBtc: (value) => `${integerFormatter.format(value)} BTC`,
    chartFootnote: (start, end, low, high) =>
      `區間：${start} 至 ${end} · mNAV 範圍：${low} 到 ${high}`,
    chartError: (message) =>
      `${message}。如果你是在沒有外網的本地環境預覽，部署到 Vercel 或其他雲端平台後通常就能正常抓取資料。`,
    tableChangeDash: "-",
    tooltipMnav: (value) => `mNAV：${value}`,
    tooltipStock: (value) => `MSTR 股價：${value}`,
    tooltipBtc: (value) => `BTC 價格：${value}`
  },
  en: {
    toggle: "中文",
    pageTitle: "Strategy mNAV Dashboard",
    heroCopy:
      "<strong>Live mNAV, MSTR price, BTC price, and BTC NAV per share</strong> for Strategy (MSTR).",
    heroFocusLabel: "Coverage",
    heroFocusCaption: "Latest mNAV",
    gaugeKicker: "mNAV Gauge",
    gaugeTitle: "Current Valuation Position",
    summaryKicker: "Gemini Summary",
    summaryTitle: "Key Takeaways",
    stockPriceLabel: "Stock Price",
    navPerShareLabel: "BTC NAV / Share",
    marketCapLabel: "Market Cap",
    relativeNavLabel: "Vs NAV",
    chartKicker: "Time Series",
    chartTitle: "mNAV, MSTR Price, and BTC Price",
    legendStock: "MSTR Price",
    legendBtc: "BTC Price",
    range: {
      "1D": "1D",
      "1W": "1W",
      "1M": "1M",
      "3M": "3M",
      "6M": "6M",
      "1Y": "1Y",
      "2Y": "2Y",
      "5Y": "5Y"
    },
    trendKicker: "Trend Table",
    trendTitle: "mNAV Trend",
    treasuryBtcLabel: "BTC Holdings",
    dilutedSharesLabel: "Diluted Shares",
    detailDateLabel: "Latest Timestamp",
    tableHeadDate: "Date",
    tableHeadChange: "Change vs Prev Day",
    tableHeadStock: "MSTR Price",
    tableHeadBtc: "BTC Price",
    tableHeadMarketCap: "Market Cap",
    tableFootnote:
      "Each row shows daily mNAV and the change versus the previous trading day for quick price-vs-BTC comparison.",
    errorKicker: "Data Status",
    errorTitle: "Unable to load live data right now",
    loadingSummary: "Loading summary...",
    loadingTrend: "Loading trend data...",
    noTrend: "No trend data available.",
    trendUnavailable: "Trend data unavailable.",
    unavailable: "Unavailable",
    heroDate: (date) => `Latest timestamp ${date}`,
    gaugePremium: (value) => `Trading at a ${value.toFixed(2)}% premium to BTC NAV per share`,
    gaugeDiscount: (value) => `Trading at a ${value.toFixed(2)}% discount to BTC NAV per share`,
    gaugeFlat: "Trading close to BTC NAV per share",
    relativePremium: (value) => `Premium ${value.toFixed(2)}%`,
    relativeDiscount: (value) => `Discount ${value.toFixed(2)}%`,
    treasuryBtc: (value) => `${integerFormatter.format(value)} BTC`,
    chartFootnote: (start, end, low, high) =>
      `Window: ${start} to ${end} · mNAV range: ${low} to ${high}`,
    chartError: (message) =>
      `${message}. If you are previewing locally without outbound network access, deployment to Vercel usually resolves it.`,
    tableChangeDash: "-",
    tooltipMnav: (value) => `mNAV: ${value}`,
    tooltipStock: (value) => `MSTR Price: ${value}`,
    tooltipBtc: (value) => `BTC Price: ${value}`
  }
};

let chart;
let indicatorData;
let activeRange = "1W";
let currentLanguage = localStorage.getItem("robot-advisor-language") || "zh-Hant";
const summaryCacheByLanguage = {};

function copy() {
  return COPY[currentLanguage];
}

function setText(id, value) {
  const element = document.getElementById(id);
  element.textContent = value;
  element.classList.remove("skeleton");
}

function setHtml(id, value) {
  const element = document.getElementById(id);
  element.innerHTML = value;
}

function formatMultiple(value) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return value.toFixed(2);
}

function formatPercent(value) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

function formatBillions(value) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return `$${value.toFixed(2)}B`;
}

function formatDateLabel(value) {
  if (!value) {
    return "N/A";
  }

  return String(value).slice(0, 10);
}

function hexToRgba(hex, alpha) {
  const sanitized = hex.replace("#", "");
  const red = parseInt(sanitized.slice(0, 2), 16);
  const green = parseInt(sanitized.slice(2, 4), 16);
  const blue = parseInt(sanitized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getVisibleSeries() {
  const series = activeRange === "1D" ? indicatorData.intradaySeries || [] : indicatorData.series;
  const length = RANGE_LENGTHS[activeRange] || RANGE_LENGTHS.MAX;

  if (!Number.isFinite(length) || series.length <= length) {
    return series;
  }

  return series.slice(-length);
}

function getPointLabel(point) {
  return point.displayDate || point.date;
}

function formatWindowLabel(point) {
  if (!point) {
    return "";
  }

  return getPointLabel(point);
}

function applyStaticCopy() {
  const t = copy();

  document.documentElement.lang = currentLanguage === "en" ? "en" : "zh-Hant";
  setText("language-toggle-label", t.toggle);
  setText("page-title", t.pageTitle);
  setHtml("hero-copy", t.heroCopy);
  setText("hero-focus-label", t.heroFocusLabel);
  setText("hero-focus-caption", t.heroFocusCaption);
  setText("gauge-kicker", t.gaugeKicker);
  setText("gauge-title", t.gaugeTitle);
  setText("summary-kicker", t.summaryKicker);
  setText("summary-title", t.summaryTitle);
  setText("stock-price-label", t.stockPriceLabel);
  setText("nav-per-share-label", t.navPerShareLabel);
  setText("market-cap-label", t.marketCapLabel);
  setText("relative-nav-label", t.relativeNavLabel);
  setText("chart-kicker", t.chartKicker);
  setText("chart-title", t.chartTitle);
  setText("legend-mnav-label", "mNAV");
  setText("legend-stock-label", t.legendStock);
  setText("legend-btc-label", t.legendBtc);
  setText("range-1d", t.range["1D"]);
  setText("range-1w", t.range["1W"]);
  setText("range-1m", t.range["1M"]);
  setText("range-3m", t.range["3M"]);
  setText("range-6m", t.range["6M"]);
  setText("range-1y", t.range["1Y"]);
  setText("range-2y", t.range["2Y"]);
  setText("range-5y", t.range["5Y"]);
  setText("trend-kicker", t.trendKicker);
  setText("trend-title", t.trendTitle);
  setText("treasury-btc-label", t.treasuryBtcLabel);
  setText("diluted-shares-label", t.dilutedSharesLabel);
  setText("detail-date-label", t.detailDateLabel);
  setText("table-head-date", t.tableHeadDate);
  setText("table-head-change", t.tableHeadChange);
  setText("table-head-stock", t.tableHeadStock);
  setText("table-head-btc", t.tableHeadBtc);
  setText("table-head-marketcap", t.tableHeadMarketCap);
  setText("table-footnote", t.tableFootnote);
  setText("error-kicker", t.errorKicker);
  setText("error-title", t.errorTitle);
  document.getElementById("ai-summary").textContent = t.loadingSummary;
  document.getElementById("trend-table-body").innerHTML =
    `<tr><td colspan="6" class="trend-table-empty">${t.loadingTrend}</td></tr>`;
}

function updateRangeButtons() {
  document.querySelectorAll(".range-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.range === activeRange);
  });
}

function updateGauge(summary) {
  const t = copy();
  const clampedRatio = Math.max(0, Math.min(2, summary.latestMnav));
  const rotation = -90 + (clampedRatio / 2) * 180;
  const needle = document.getElementById("gauge-needle");
  needle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

  setText("gauge-value", formatMultiple(summary.latestMnav));

  if (summary.latestPremiumToNavPct > 0) {
    setText("gauge-status", t.gaugePremium(summary.latestPremiumToNavPct));
  } else if (summary.latestDiscountToNavPct > 0) {
    setText("gauge-status", t.gaugeDiscount(summary.latestDiscountToNavPct));
  } else {
    setText("gauge-status", t.gaugeFlat);
  }
}

function buildChart() {
  const t = copy();
  const visibleSeries = getVisibleSeries();
  const canvas = document.getElementById("indicator-chart");
  const context = canvas.getContext("2d");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(context, {
    type: "line",
    data: {
      labels: visibleSeries.map((point) => getPointLabel(point)),
      datasets: [
        {
          label: "mNAV",
          data: visibleSeries.map((point) => point.mnav),
          borderColor: "#237a73",
          backgroundColor: hexToRgba("#237a73", 0.16),
          borderWidth: 2.4,
          pointRadius: visibleSeries.length <= 5 ? 2.5 : 0,
          pointHoverRadius: 4,
          tension: 0.18,
          fill: false,
          yAxisID: "yMnav"
        },
        {
          label: t.legendStock,
          data: visibleSeries.map((point) => point.stockPrice),
          borderColor: "#b8742b",
          backgroundColor: hexToRgba("#b8742b", 0.08),
          borderWidth: 1.6,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0.18,
          fill: false,
          borderDash: [6, 4],
          yAxisID: "yStock"
        },
        {
          label: t.legendBtc,
          data: visibleSeries.map((point) => point.btcPrice),
          borderColor: "#5677b5",
          backgroundColor: hexToRgba("#5677b5", 0.08),
          borderWidth: 1.6,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0.18,
          fill: false,
          borderDash: [3, 4],
          yAxisID: "yBtc"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: "rgba(255, 250, 242, 0.96)",
          titleColor: "#1d2a24",
          bodyColor: "#1d2a24",
          borderColor: "rgba(29, 42, 36, 0.1)",
          borderWidth: 1,
          callbacks: {
            title(items) {
              return items[0]?.label || "";
            },
            label(context) {
              if (context.dataset.yAxisID === "yMnav") {
                return t.tooltipMnav(formatMultiple(context.parsed.y));
              }

              if (context.dataset.yAxisID === "yStock") {
                return t.tooltipStock(currencyFormatter.format(context.parsed.y));
              }

              return t.tooltipBtc(currencyFormatter.format(context.parsed.y));
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 8,
            color: "#6d766c"
          },
          grid: {
            color: "rgba(29, 42, 36, 0.05)"
          }
        },
        yMnav: {
          type: "linear",
          position: "left",
          ticks: {
            color: "#237a73",
            callback(value) {
              return formatMultiple(Number(value));
            }
          },
          grid: {
            color: "rgba(29, 42, 36, 0.08)"
          }
        },
        yStock: {
          type: "linear",
          position: "right",
          ticks: {
            color: "#b8742b",
            callback(value) {
              return currencyFormatter.format(value);
            }
          },
          grid: {
            drawOnChartArea: false
          }
        },
        yBtc: {
          type: "linear",
          position: "right",
          offset: true,
          ticks: {
            color: "#5677b5",
            callback(value) {
              return currencyFormatter.format(value);
            }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

function buildTrendRows() {
  const t = copy();
  const rows = (indicatorData.series || []).slice(-10).reverse();
  const tableBody = document.getElementById("trend-table-body");
  const dilutedShares = indicatorData.metadata.company.dilutedSharesOutstanding;

  if (!rows.length) {
    tableBody.innerHTML = `<tr><td colspan="6" class="trend-table-empty">${t.noTrend}</td></tr>`;
    return;
  }

  tableBody.innerHTML = rows
    .map((row, index) => {
      const previousRow = rows[index + 1];
      const changePct = previousRow ? ((row.mnav / previousRow.mnav) - 1) * 100 : null;
      const changeClass =
        changePct === null
          ? "is-neutral"
          : changePct > 0
            ? "is-positive"
            : changePct < 0
              ? "is-negative"
              : "is-neutral";
      const marketCap = (row.stockPrice * dilutedShares) / 1000000000;

      return `
        <tr>
          <td>${formatDateLabel(row.date)}</td>
          <td class="trend-table-mnav">${formatMultiple(row.mnav)}</td>
          <td class="${changeClass}">${changePct === null ? t.tableChangeDash : formatPercent(changePct)}</td>
          <td>${currencyFormatter.format(row.stockPrice)}</td>
          <td>${currencyFormatter.format(row.btcPrice)}</td>
          <td>${formatBillions(marketCap)}</td>
        </tr>
      `;
    })
    .join("");
}

function updateView() {
  const t = copy();
  const { metadata, summary } = indicatorData;
  const company = metadata.company;
  const visibleSeries = getVisibleSeries();
  const windowStart = visibleSeries[0];
  const windowEnd = visibleSeries.at(-1);
  const visibleMin = Math.min(...visibleSeries.map((point) => point.mnav));
  const visibleMax = Math.max(...visibleSeries.map((point) => point.mnav));
  const relativeNavText =
    summary.latestPremiumToNavPct > 0
      ? t.relativePremium(summary.latestPremiumToNavPct)
      : t.relativeDiscount(summary.latestDiscountToNavPct);

  setText("hero-company", `${company.name} (${company.ticker})`);
  setText("hero-mnav", formatMultiple(summary.latestMnav));
  setText("stock-price", currencyFormatter.format(summary.latestStockPrice));
  setText("nav-per-share", currencyFormatter.format(summary.latestNavPerShare));
  setText("market-cap", formatBillions(summary.latestMarketCapBillions));
  setText("relative-nav", relativeNavText);
  setText("detail-date", summary.latestDate);
  setText("treasury-btc", t.treasuryBtc(company.btcHoldings));
  setText("diluted-shares", integerFormatter.format(company.dilutedSharesOutstanding));

  document.getElementById("hero-date").textContent = t.heroDate(summary.latestDate);
  document.getElementById("chart-footnote").textContent = t.chartFootnote(
    formatWindowLabel(windowStart),
    formatWindowLabel(windowEnd),
    formatMultiple(visibleMin),
    formatMultiple(visibleMax)
  );

  document.getElementById("legend-mnav").style.background = "#237a73";
  document.getElementById("legend-stock").style.background = "#b8742b";
  document.getElementById("legend-btc").style.background = "#5677b5";

  updateGauge(summary);
  buildChart();
  buildTrendRows();
  updateRangeButtons();
}

async function loadGeneratedSummary() {
  return loadGeneratedSummaryFromPromise(fetchSummaryPayload());
}

async function fetchSummaryPayload() {
  if (summaryCacheByLanguage[currentLanguage]?.usedLlm) {
    return summaryCacheByLanguage[currentLanguage];
  }

  const response = await fetch(
    `/api/summary?lang=${encodeURIComponent(currentLanguage === "en" ? "en" : "zh-Hant")}`
  );
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.details || payload.error || "Unknown error");
  }

  if (payload.usedLlm) {
    summaryCacheByLanguage[currentLanguage] = payload;
  }

  return payload;
}

async function loadGeneratedSummaryFromPromise(summaryPromise) {
  const t = copy();

  try {
    const payload = await summaryPromise;
    document.getElementById("ai-summary").textContent =
      payload.text || (indicatorData ? indicatorData.aiSummary : t.loadingSummary);
  } catch (error) {
    document.getElementById("ai-summary").textContent =
      indicatorData?.aiSummary || t.loadingSummary;
  }
}

function bindRangeButtons() {
  document.querySelectorAll(".range-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeRange = button.dataset.range;
      updateView();
    });
  });
}

function bindLanguageToggle() {
  document.getElementById("language-toggle").addEventListener("click", async () => {
    currentLanguage = currentLanguage === "zh-Hant" ? "en" : "zh-Hant";
    localStorage.setItem("robot-advisor-language", currentLanguage);
    applyStaticCopy();

    if (indicatorData) {
      updateView();
      if (summaryCacheByLanguage[currentLanguage]?.usedLlm) {
        document.getElementById("ai-summary").textContent =
          summaryCacheByLanguage[currentLanguage].text;
      } else {
        await loadGeneratedSummary();
      }
    }
  });
}

function showError(message) {
  const t = copy();
  document.getElementById("error-panel").classList.remove("hidden");
  document.getElementById("error-message").textContent = t.chartError(message);

  [
    "hero-company",
    "hero-mnav",
    "gauge-value",
    "gauge-status",
    "stock-price",
    "nav-per-share",
    "market-cap",
    "relative-nav",
    "detail-date",
    "treasury-btc",
    "diluted-shares"
  ].forEach((id) => setText(id, t.unavailable));

  document.getElementById("trend-table-body").innerHTML =
    `<tr><td colspan="6" class="trend-table-empty">${t.trendUnavailable}</td></tr>`;
}

async function loadDashboard() {
  try {
    const summaryPromise = fetchSummaryPayload();
    const response = await fetch("/api/indicator");
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.details || payload.error || "Unknown error");
    }

    indicatorData = payload;
    bindRangeButtons();
    updateView();
    await loadGeneratedSummaryFromPromise(summaryPromise);
  } catch (error) {
    showError(error.message);
  }
}

applyStaticCopy();
bindLanguageToggle();
loadDashboard();
