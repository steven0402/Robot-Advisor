const { getCachedIndicatorData } = require("../lib/cache");
const { getIndicatorData } = require("../lib/indicator-data");
const { createSummaryResponse } = require("../lib/gemini-summary");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(405).end(
      JSON.stringify({
        error: "Method not allowed."
      })
    );
    return;
  }

  try {
    const data = await getCachedIndicatorData(getIndicatorData);
    const summaryPayload = await createSummaryResponse(data);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");
    res.status(200).end(JSON.stringify(summaryPayload));
  } catch (error) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(500).end(
      JSON.stringify({
        error: "Unable to generate summary.",
        details: error.message
      })
    );
  }
};
