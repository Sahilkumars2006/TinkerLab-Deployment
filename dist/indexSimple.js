// server/indexSimple.ts
import express from "express";

// server/routesSimple.ts
function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
}

// server/log.ts
var isProduction = process.env.NODE_ENV === "production";
var log = (...args) => {
  if (isProduction) {
    console.log(...args);
  } else {
    console.log("\u{1F6E0}\uFE0F ", ...args);
  }
};

// server/indexSimple.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "\u2026";
      log(logLine);
    }
  });
  next();
});
registerRoutes(app);
var indexSimple_default = app;
export {
  indexSimple_default as default
};
