const { getCachedSummary } = require("./cache");

function buildPrompt(indicatorData, language = "zh-Hant") {
  const { metadata, summary } = indicatorData;

  if (language === "en") {
    return [
      "You are writing the 'Key Takeaways' section for a financial dashboard.",
      "Use English.",
      "Keep the total length around 150 to 260 words.",
      "Split the output into 3 sections and allow flexible sentence counts when needed.",
      "Use exactly this format:",
      "Valuation Focus: ...",
      "Short-Term Move: ...",
      "Price Action Analysis: ...",
      "Valuation Focus should analyze the latest mNAV, stock price, BTC NAV per share, and whether the stock trades at a premium or discount to BTC NAV per share.",
      "Short-Term Move should focus on 1-week and 1-month mNAV changes, including direction, magnitude, and whether momentum is improving, weakening, or consolidating.",
      "Price Action Analysis should explain whether the recent move was mainly driven by the stock, BTC, or BTC NAV per share, and whether these series are moving in sync.",
      "Do not use bullet points.",
      "Do not use markdown.",
      "Do not provide investment advice.",
      "Do not explain what mNAV, NAV, or BTC NAV per share means.",
      "Avoid generic textbook phrasing. Base the commentary on the supplied numbers and make a current market interpretation.",
      "If the data is mixed or inconclusive, say so directly instead of forcing a strong conclusion.",
      "Use a professional market-brief tone that prioritizes interpretation over definition.",
      "",
      `Company: ${metadata.company.companyLabel}`,
      `Ticker: ${metadata.company.ticker}`,
      `Indicator: ${metadata.indicatorName}`,
      `Formula: ${metadata.formula}`,
      `Snapshot date: ${metadata.company.snapshotDate}`,
      `BTC holdings: ${metadata.company.btcHoldings}`,
      `Diluted shares outstanding: ${metadata.company.dilutedSharesOutstanding}`,
      `Latest date: ${summary.latestDate}`,
      `Latest mNAV: ${summary.latestMnav}`,
      `Latest stock price: ${summary.latestStockPrice}`,
      `Latest BTC price: ${summary.latestBtcPrice}`,
      `Latest BTC NAV per share: ${summary.latestNavPerShare}`,
      `Weekly change: ${summary.weeklyChangePct}%`,
      `Monthly change: ${summary.monthlyChangePct}%`
    ].join("\n");
  }

  return [
    "你正在替金融儀表板撰寫「即時重點」區塊。",
    "請使用繁體中文。",
    "總長度控制在 250 到 450 個中文字左右。",
    "請分成 3 個主題重點，可以依內容需要自由安排句數，但避免冗長。",
    "請直接使用這種格式輸出：",
    "估值重點：...",
    "短線變化：...",
    "漲跌分析：...",
    "估值重點要根據最新 mNAV、股價、每股 BTC NAV，分析目前估值所處位置，以及相對每股 BTC NAV 是溢價還是折價。",
    "短線變化要聚焦近 1 週與近 1 月的 mNAV 變化，指出變化方向、幅度，以及短線節奏是轉強、轉弱還是整理。",
    "漲跌分析要根據股價、BTC 價格、每股 BTC NAV 之間的相對變動，分析這次上漲或下跌主要是由哪個因素帶動，並描述三者是否同步。",
    "不要使用條列符號。",
    "不要使用 markdown。",
    "不要給投資建議。",
    "不要解釋 mNAV、NAV、BTC NAV per share 是什麼，也不要做名詞教學。",
    "不要寫成固定模板套話；要根據提供的數據做出當下的分析與判讀。",
    "如果數據顯示關係矛盾或沒有明確訊號，就直接指出，而不是硬湊結論。",
    "語氣要像首頁上的專業市場摘要，清楚、完整、數據導向，重點放在判讀而不是定義。",
    "",
    `Company: ${metadata.company.companyLabel}`,
    `Ticker: ${metadata.company.ticker}`,
    `Indicator: ${metadata.indicatorName}`,
    `Formula: ${metadata.formula}`,
    `Snapshot date: ${metadata.company.snapshotDate}`,
    `BTC holdings: ${metadata.company.btcHoldings}`,
    `Diluted shares outstanding: ${metadata.company.dilutedSharesOutstanding}`,
    `Latest date: ${summary.latestDate}`,
    `Latest mNAV: ${summary.latestMnav}`,
    `Latest stock price: ${summary.latestStockPrice}`,
    `Latest BTC price: ${summary.latestBtcPrice}`,
    `Latest BTC NAV per share: ${summary.latestNavPerShare}`,
    `Weekly change: ${summary.weeklyChangePct}%`,
    `Monthly change: ${summary.monthlyChangePct}%`
  ].join("\n");
}

function buildFallbackSummary(indicatorData, language = "zh-Hant") {
  const summary = indicatorData.summary;

  if (language === "en") {
    const relativeNavText =
      summary.latestPremiumToNavPct > 0
        ? `the stock is trading at a ${summary.latestPremiumToNavPct}% premium to BTC NAV per share`
        : `the stock is trading at a ${summary.latestDiscountToNavPct}% discount to BTC NAV per share`;
    const weeklyDirection =
      summary.weeklyChangePct === null
        ? "1-week mNAV change is unavailable"
        : summary.weeklyChangePct >= 0
          ? `1-week mNAV is up ${summary.weeklyChangePct}%`
          : `1-week mNAV is down ${Math.abs(summary.weeklyChangePct)}%`;
    const monthlyDirection =
      summary.monthlyChangePct === null
        ? "1-month mNAV change is unavailable"
        : summary.monthlyChangePct >= 0
          ? `1-month mNAV is up ${summary.monthlyChangePct}%`
          : `1-month mNAV is down ${Math.abs(summary.monthlyChangePct)}%`;

    return `Valuation Focus: Latest mNAV is ${summary.latestMnav}, and ${relativeNavText}. Short-Term Move: ${weeklyDirection}, while ${monthlyDirection}. Price Action Analysis: The latest snapshot is based on ${summary.latestDate}, with the stock at ${summary.latestStockPrice}, BTC at ${summary.latestBtcPrice}, and BTC NAV per share at ${summary.latestNavPerShare}.`;
  }

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

async function createSummaryResponse(indicatorData, language = "zh-Hant") {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    return getCachedSummary(
      async () => ({
        provider: "gemini-placeholder",
        usedLlm: false,
        text:
          language === "en"
            ? "Gemini summary placeholder. Add `GEMINI_API_KEY` and redeploy to see live model-generated commentary here."
            : "Gemini 即時重點預留區。設定 `GEMINI_API_KEY` 並重新部署後，這裡會顯示模型生成的市場摘要。"
      }),
      indicatorData,
      model,
      false,
      language
    );
  }

  return getCachedSummary(
    async () => {
      try {
        const endpoint =
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json; charset=utf-8"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: buildPrompt(indicatorData, language)
                  }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini request failed: ${response.status} ${response.statusText}`);
        }

        const payload = await response.json();
        const text =
          payload.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || "")
            .join("")
            .trim() || buildFallbackSummary(indicatorData, language);

        return {
          provider: "gemini",
          model,
          usedLlm: true,
          language,
          text
        };
      } catch (error) {
        return {
          provider: "rule-based-fallback",
          usedLlm: false,
          language,
          text: buildFallbackSummary(indicatorData, language),
          warning: error.message
        };
      }
    },
    indicatorData,
    model,
    true,
    language
  );
}

module.exports = {
  createSummaryResponse
};
