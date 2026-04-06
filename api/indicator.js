const { getCachedIndicatorData } = require("../lib/cache");
const { getIndicatorData } = require("../lib/indicator-data");

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
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(200).end(JSON.stringify(data));
  } catch (error) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(500).end(
      JSON.stringify({
        error: "Unable to load indicator data.",
        details: error.message
      })
    );
  }
};
