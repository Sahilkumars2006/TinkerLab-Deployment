// server/start.ts
import path from "path";
import express from "express";
var app = express();
var PORT = process.env.PORT || 3e3;
var __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.listen(PORT, () => {
  console.log(`\u2705 Server running at http://localhost:${PORT}`);
});
