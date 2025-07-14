import path from "path";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Serve static files from the built frontend
app.use(express.static(path.join(__dirname, "public")));

// For SPA routing: serve index.html for unknown routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
