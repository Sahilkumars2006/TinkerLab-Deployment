import app from "./indexSimple";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
