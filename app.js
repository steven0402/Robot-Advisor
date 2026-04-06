const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const integerFormatter = new Intl.NumberFormat("en-US");

const RANGE_LENGTHS = {
  "1W": 5,
  "1M": 22,
  "3M": 66,
  "6M": 132,
  "1Y": 252,
  "2Y": 504,
  "5Y": 1260
};

let chart;
let indicatorData;
let activeRange = "1W";

function setText(id, value) {
  const element = document.getElementById(id);
  element.textContent = value;
  element.classList.remove("skeleton");
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

function hexToRgba(hex, alpha) {
  const sanitized = hex.replace("#", "");
  const red = parseInt(sanitized.slice(0, 2), 16);
  const green = parseInt(sanitized.slice(2, 4), 16);
  const blue = parseInt(sanitized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getVisibleSeries() {
  const series = indicatorData.series;
  const length = RANGE_LENGTHS[activeRange] || RANGE_LENGTHS.MAX;

  if (!Number.isFinite(length) || series.length <= length) {
    return series;
  }

  return series.slice(-length);
}

function updateRangeButtons() {
  document.querySelectorAll(".range-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.range === activeRange);
  });
}

function updateGauge(summary) {
  const clampedRatio = Math.max(0, Math.min(2, summary.latestMnav));
  const rotation = -90 + (clampedRatio / 2) * 180;
  const needle = document.getElementById("gauge-needle");
  needle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

  setText("gauge-value", formatMultiple(summary.latestMnav));

  if (summary.latestPremiumToNavPct > 0) {
    setText("gauge-status", `股價較每股 BTC NAV 溢價 ${summary.latestPremiumToNavPct.toFixed(2)}%`);
  } else if (summary.latestDiscountToNavPct > 0) {
    setText("gauge-status", `股價較每股 BTC NAV 折價 ${summary.latestDiscountToNavPct.toFixed(2)}%`);
  } else {
    setText("gauge-status", "股價接近每股 BTC NAV");
  }
}

function buildChart() {
  const visibleSeries = getVisibleSeries();
  const company = indicatorData.metadata.company;
  const canvas = document.getElementById("indicator-chart");
  const context = canvas.getContext("2d");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(context, {
    type: "line",
    data: {
      labels: visibleSeries.map((point) => point.date),
      datasets: [
        {
          label: "mNAV",
          data: visibleSeries.map((point) => point.mnav),
          borderColor: company.color,
          backgroundColor: hexToRgba(company.color, 0.1),
          borderWidth: 2.2,
          pointRadius: visibleSeries.length <= 5 ? 2 : 0,
          pointHoverRadius: 4,
          tension: 0,
          fill: false,
          yAxisID: "yMnav"
        },
        {
          label: "MSTR 股價",
          data: visibleSeries.map((point) => point.stockPrice),
          borderColor: "#c76a1b",
          backgroundColor: hexToRgba("#c76a1b", 0.08),
          borderWidth: 1.4,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0,
          fill: false,
          borderDash: [5, 4],
          yAxisID: "yStock"
        },
        {
          label: "BTC 價格",
          data: visibleSeries.map((point) => point.btcPrice),
          borderColor: "#3a6ff7",
          backgroundColor: hexToRgba("#3a6ff7", 0.08),
          borderWidth: 1.4,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0,
          fill: false,
          borderDash: [2, 4],
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
          callbacks: {
            label(context) {
              if (context.dataset.yAxisID === "yMnav") {
                return `mNAV：${formatMultiple(context.parsed.y)}`;
              }

              return `${context.dataset.label}：${currencyFormatter.format(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 8,
            color: "#5d6b64"
          },
          grid: {
            display: false
          }
        },
        yMnav: {
          type: "linear",
          position: "left",
          ticks: {
            color: company.color,
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
            color: "#c76a1b",
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
            color: "#3a6ff7",
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

function updateView() {
  const { metadata, summary } = indicatorData;
  const company = metadata.company;
  const visibleSeries = getVisibleSeries();
  const windowStart = visibleSeries[0];
  const windowEnd = visibleSeries.at(-1);
  const visibleMin = Math.min(...visibleSeries.map((point) => point.mnav));
  const visibleMax = Math.max(...visibleSeries.map((point) => point.mnav));
  const relativeNavText =
    summary.latestPremiumToNavPct > 0
      ? `溢價 ${summary.latestPremiumToNavPct.toFixed(2)}%`
      : `折價 ${summary.latestDiscountToNavPct.toFixed(2)}%`;

  setText("hero-company", `${company.name} (${company.ticker})`);
  setText("hero-mnav", formatMultiple(summary.latestMnav));
  setText("stock-price", currencyFormatter.format(summary.latestStockPrice));
  setText("nav-per-share", currencyFormatter.format(summary.latestNavPerShare));
  setText("market-cap", formatBillions(summary.latestMarketCapBillions));
  setText("relative-nav", relativeNavText);
  setText("detail-mnav", formatMultiple(summary.latestMnav));
  setText("detail-date", summary.latestDate);
  setText("treasury-btc", `${integerFormatter.format(company.btcHoldings)} BTC`);
  setText("diluted-shares", integerFormatter.format(company.dilutedSharesOutstanding));
  setText("weekly-change", formatPercent(summary.weeklyChangePct));
  setText("monthly-change", formatPercent(summary.monthlyChangePct));

  document.getElementById("hero-date").textContent = `最新交易日 ${summary.latestDate}`;
  document.getElementById(
    "chart-footnote"
  ).textContent = `區間：${windowStart.date} 至 ${windowEnd.date} · mNAV 範圍：${formatMultiple(
    visibleMin
  )} 到 ${formatMultiple(visibleMax)}`;

  document.getElementById("legend-mnav").style.background = company.color;
  document.getElementById("legend-stock").style.background = "#c76a1b";
  document.getElementById("legend-btc").style.background = "#3a6ff7";

  updateGauge(summary);
  buildChart();
  updateRangeButtons();
}

async function loadGeneratedSummary() {
  try {
    const response = await fetch("/api/summary");
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.details || payload.error || "Unknown error");
    }

    document.getElementById("ai-summary").textContent = payload.text || indicatorData.aiSummary;
  } catch (error) {
    document.getElementById("ai-summary").textContent = indicatorData.aiSummary;
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

function showError(message) {
  document.getElementById("error-panel").classList.remove("hidden");
  document.getElementById("error-message").textContent = message;

  [
    "hero-company",
    "hero-mnav",
    "gauge-value",
    "gauge-status",
    "stock-price",
    "nav-per-share",
    "market-cap",
    "relative-nav",
    "detail-mnav",
    "detail-date",
    "treasury-btc",
    "diluted-shares",
    "weekly-change",
    "monthly-change"
  ].forEach((id) => setText(id, "Unavailable"));
}

async function loadDashboard() {
  try {
    const response = await fetch("/api/indicator");
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.details || payload.error || "Unknown error");
    }

    indicatorData = payload;
    bindRangeButtons();
    updateView();
    await loadGeneratedSummary();
  } catch (error) {
    showError(
      `${error.message}。如果你是在沒有外網的本地環境預覽，部署到 Vercel 或其他雲端平台後通常就能正常抓取資料。`
    );
  }
}

loadDashboard();
