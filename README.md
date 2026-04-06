# HW2 Robot Advisor

以 **Strategy (MSTR)** 為主體的 DAT.co 指標網站，主指標為 **mNAV**，並搭配 MSTR 股價與 BTC 價格做時間序列觀察。

## 目前功能

- 單一公司：Strategy（前稱 MicroStrategy，Ticker: `MSTR`）
- 主指標：`mNAV`
- 圖表區間：`1週`、`1個月`、`3個月`、`半年`、`1年`、`2年`、`5年`
- `即時重點` 區塊已預留給 **Gemini LLM**

## 指標公式

- `BTC NAV per share = BTC price × BTC holdings / diluted shares outstanding`
- `mNAV = stock price / BTC NAV per share`

## 資料來源

- Treasury snapshot: [Strategy Shares](https://www.strategy.com/shares)
- MSTR stock price: [Yahoo Finance MSTR](https://finance.yahoo.com/quote/MSTR/)
- BTC price: [Yahoo Finance BTC-USD](https://finance.yahoo.com/quote/BTC-USD/)

## 本機啟動

```bash
npm run dev
```

然後打開 [http://127.0.0.1:3000](http://127.0.0.1:3000)。

## Gemini 接法

專案已經內建好 Gemini 摘要 API，檔案在：

- [lib/gemini-summary.js](/Users/stevenlai/Desktop/Bitcoin/hw2/lib/gemini-summary.js)
- [api/summary.js](/Users/stevenlai/Desktop/Bitcoin/hw2/api/summary.js)

### 1. 取得 Gemini API Key

1. 到 Google AI Studio 建立 API key
2. 將 key 存成環境變數 `GEMINI_API_KEY`

### 2. 本機設定

先建立 `.env.local`：

```bash
cp .env.example .env.local
```

然後填入：

```env
GEMINI_API_KEY=你的金鑰
GEMINI_MODEL=gemini-2.5-flash
```

### 3. 目前程式如何運作

- 前端會呼叫 `/api/summary`
- `/api/summary` 會進到 [api/summary.js](/Users/stevenlai/Desktop/Bitcoin/hw2/api/summary.js)
- 後端再透過 [lib/gemini-summary.js](/Users/stevenlai/Desktop/Bitcoin/hw2/lib/gemini-summary.js) 呼叫 Gemini `generateContent`
- 如果沒有 `GEMINI_API_KEY`，`即時重點` 會顯示 Gemini 預留占位文案，不會報錯
- Gemini 摘要已加上後端快取，不會每次重新整理頁面都重打一次

### 4. 如果你想改 prompt

直接改 [lib/gemini-summary.js](/Users/stevenlai/Desktop/Bitcoin/hw2/lib/gemini-summary.js) 裡的 `buildPrompt()`。

## Vercel 部署

專案已經有：

- [vercel.json](/Users/stevenlai/Desktop/Bitcoin/hw2/vercel.json)
- serverless route: `/api/indicator`
- serverless route: `/api/summary`

### 部署步驟

1. 把這個資料夾推到 GitHub
2. 到 Vercel 匯入這個 repo
3. Framework Preset 選 `Other`
4. 在 Vercel 專案設定的 Environment Variables 加上：

```env
GEMINI_API_KEY=你的金鑰
GEMINI_MODEL=gemini-2.5-flash
```

5. 按 Deploy

### 重新部署

之後如果你更新程式：

- push 到 GitHub，Vercel 會自動重新部署
- 如果只改環境變數，記得在 Vercel 重新 Deploy 一次

## 快取設定

目前後端有兩層快取：

- `indicator` 資料快取：預設 `30 分鐘`
- `summary` / Gemini 摘要快取：預設 `6 小時`

如果你要調整，可以加這兩個環境變數：

```env
INDICATOR_CACHE_TTL_MS=1800000
SUMMARY_CACHE_TTL_MS=21600000
```

用途是：

- `INDICATOR_CACHE_TTL_MS`
  控制多久重新抓一次 MSTR / BTC 外部資料
- `SUMMARY_CACHE_TTL_MS`
  控制多久重新打一次 Gemini

## 備註

- 目前 `即時重點` 是 Gemini 預留區
- 沒有設定 Gemini key 時，網站仍然可以正常顯示數據與圖表
- 最新日期會依照最近交易日更新，不一定等於今天
- BTC 與 MSTR 圖表目前都使用 Yahoo Finance 5 年日線資料
