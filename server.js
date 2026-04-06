const http = require("http");
const fs = require("fs");
const path = require("path");
const { getCachedIndicatorData } = require("./lib/cache");
const { getIndicatorData } = require("./lib/indicator-data");
const { createSummaryResponse } = require("./lib/gemini-summary");

function loadEnvFile(filename) {
  const filePath = path.join(__dirname, filename);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile(".env.local");

const rootDir = __dirname;
const port = process.env.PORT || 3000;
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".env": "text/plain; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(body));
}

function sendFile(res, filePath) {
  const extension = path.extname(filePath);
  const contentType = mimeTypes[extension] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: "File not found." });
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (requestUrl.pathname === "/api/indicator") {
    try {
      const data = await getCachedIndicatorData(getIndicatorData);
      sendJson(res, 200, data);
    } catch (error) {
      sendJson(res, 500, {
        error: "Unable to load indicator data.",
        details: error.message
      });
    }
    return;
  }

  if (requestUrl.pathname === "/api/summary") {
    try {
      const data = await getCachedIndicatorData(getIndicatorData);
      const language = requestUrl.searchParams.get("lang") === "en" ? "en" : "zh-Hant";
      const summaryPayload = await createSummaryResponse(data, language);
      sendJson(res, 200, summaryPayload);
    } catch (error) {
      sendJson(res, 500, {
        error: "Unable to generate summary.",
        details: error.message
      });
    }
    return;
  }

  const requestedPath =
    requestUrl.pathname === "/"
      ? path.join(rootDir, "index.html")
      : path.join(rootDir, requestUrl.pathname);

  if (!requestedPath.startsWith(rootDir)) {
    sendJson(res, 403, { error: "Forbidden." });
    return;
  }

  sendFile(res, requestedPath);
});

server.listen(port, host, () => {
  console.log(`Robot Advisor running at http://${host}:${port}`);
});
