// server/start.ts
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3e3;
app.use(cors());
app.use(express.json());
var publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));
app.get("/api/test", (_req, res) => {
  res.json({ message: "TinkerLab API working!" });
});
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});
app.listen(PORT, () => {
  console.log(`\u2705 Server running at http://localhost:${PORT}`);
});
