import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Support __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve frontend from dist/public
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// 🔧 Your API routes here
app.get('/api/test', (_req, res) => {
  res.json({ message: 'TinkerLab API working!' });
});

// ✅ Catch-all for SPA routing — sends index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
