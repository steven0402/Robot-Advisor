# HW2 Report: DAT.co Robot Advisor

## 1. Selected Indicator

I selected **Bitcoin NAV per diluted share** for **Strategy (NASDAQ: MSTR)**.

This indicator estimates how much of Strategy's Bitcoin treasury value is attributable to each diluted share:

`BTC NAV per diluted share = BTC price × BTC holdings / diluted shares outstanding`

I chose this indicator because it is simple, interpretable, and strongly connected to the DAT.co concept. Instead of looking only at the total Bitcoin held by the company, the indicator converts treasury exposure into a per-share measure that is easier for investors to track over time.

## 2. Relationship with Bitcoin (BTC)

This indicator is directly related to Bitcoin because BTC price is the main changing variable in the formula. When BTC rises, the estimated NAV per diluted share also rises. When BTC falls, the indicator declines.

This relationship is useful for understanding how a Bitcoin treasury company transmits BTC exposure into its equity structure. A few possible insights are:

- A rising indicator suggests the firm's balance-sheet Bitcoin is becoming more valuable on a per-share basis.
- A falling indicator suggests weaker treasury support from Bitcoin prices.
- Investors may compare this NAV-based value with the stock's market price to judge whether the equity is trading at a premium or discount relative to its Bitcoin treasury exposure.

## 3. Data Collection

The website combines two data sources:

- **Treasury snapshot source:** Strategy's public shares page, used for BTC holdings and diluted share count.
- **BTC market data source:** CoinGecko daily BTC/USD historical prices over the last 365 days.

The implementation fetches the BTC price series from a server-side API route and applies the indicator formula to generate daily values.

## 4. Website Visualization

The website provides:

- A daily time-series chart for the last 365 days
- Summary cards for the latest indicator reading, BTC price, weekly change, and treasury size
- A written interpretation panel explaining the indicator's recent movement
- A data-source section that documents where the values come from

## 5. Deployed Website URL

Add your deployed URL here after deployment:

`https://your-project-name.vercel.app`

## 6. Implementation Notes

- The UI is implemented as a lightweight static frontend.
- The data endpoint is implemented as a serverless API route, which makes deployment easy on Vercel.
- The current version uses a fixed treasury snapshot. A future improvement would be collecting historical treasury changes over time and combining them with daily stock data to compute a full premium-to-NAV indicator.
