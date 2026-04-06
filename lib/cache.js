const INDICATOR_CACHE_TTL_MS = Number(
  process.env.INDICATOR_CACHE_TTL_MS || 5 * 60 * 1000
);
const SUMMARY_CACHE_TTL_MS = Number(
  process.env.SUMMARY_CACHE_TTL_MS || 6 * 60 * 60 * 1000
);

const indicatorCache = {
  data: null,
  fetchedAt: 0,
  pending: null
};

const summaryCache = {
  data: null,
  cacheKey: "",
  fetchedAt: 0,
  pending: null
};

function isFresh(fetchedAt, ttlMs) {
  return fetchedAt > 0 && Date.now() - fetchedAt < ttlMs;
}

async function getCachedIndicatorData(loader) {
  if (indicatorCache.data && isFresh(indicatorCache.fetchedAt, INDICATOR_CACHE_TTL_MS)) {
    return indicatorCache.data;
  }

  if (indicatorCache.pending) {
    return indicatorCache.pending;
  }

  indicatorCache.pending = (async () => {
    try {
      const data = await loader();
      indicatorCache.data = data;
      indicatorCache.fetchedAt = Date.now();
      return data;
    } finally {
      indicatorCache.pending = null;
    }
  })();

  return indicatorCache.pending;
}

function buildSummaryCacheKey(indicatorData, modelName, hasApiKey, language = "zh-Hant") {
  const summary = indicatorData.summary;

  return [
    hasApiKey ? "gemini" : "placeholder",
    modelName,
    language,
    summary.latestDate,
    summary.latestMnav,
    summary.latestStockPrice,
    summary.latestBtcPrice,
    summary.latestNavPerShare
  ].join("|");
}

async function getCachedSummary(loader, indicatorData, modelName, hasApiKey, language = "zh-Hant") {
  const cacheKey = buildSummaryCacheKey(indicatorData, modelName, hasApiKey, language);

  if (
    summaryCache.data &&
    summaryCache.cacheKey === cacheKey &&
    isFresh(summaryCache.fetchedAt, SUMMARY_CACHE_TTL_MS)
  ) {
    return summaryCache.data;
  }

  if (summaryCache.pending && summaryCache.cacheKey === cacheKey) {
    return summaryCache.pending;
  }

  summaryCache.cacheKey = cacheKey;
  summaryCache.pending = (async () => {
    try {
      const data = await loader();
      summaryCache.data = data;
      summaryCache.fetchedAt = Date.now();
      return data;
    } finally {
      summaryCache.pending = null;
    }
  })();

  return summaryCache.pending;
}

module.exports = {
  getCachedIndicatorData,
  getCachedSummary
};
