const { getCachedIndicatorData } = require("../lib/cache");
const { getIndicatorData } = require("../lib/indicator-data");

module.exports = async (req, res) => {
  try {
    const data = await getCachedIndicatorData(getIndicatorData);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).end(JSON.stringify(data));
  } catch (error) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(500).end(
      JSON.stringify({
        error: "Unable to load indicator data.",
        details: error.message
      })
    );
  }
};
