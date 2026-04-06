const { getCachedSummary } = require("./cache");

function buildPrompt(indicatorData) {
  const { metadata, summary } = indicatorData;

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

async function createSummaryResponse(indicatorData) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    return getCachedSummary(
      async () => ({
        provider: "gemini-placeholder",
        usedLlm: false,
        text: "Gemini 即時重點預留區。設定 `GEMINI_API_KEY` 並重新部署後，這裡會顯示模型生成的市場摘要。"
      }),
      indicatorData,
      model,
      false
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
                    text: buildPrompt(indicatorData)
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
            .trim() || indicatorData.aiSummary;

        return {
          provider: "gemini",
          model,
          usedLlm: true,
          text
        };
      } catch (error) {
        return {
          provider: "rule-based-fallback",
          usedLlm: false,
          text: indicatorData.aiSummary,
          warning: error.message
        };
      }
    },
    indicatorData,
    model,
    true
  );
}

module.exports = {
  createSummaryResponse
};
