const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/profiles", (req, res) => {
  const rows = db.prepare("SELECT * FROM profiles").all();
  res.json(rows);
});

app.post("/api/profiles", (req, res) => {
  const { id, name, bio, role, interview_types, topics, calendly_url, created_at } = req.body;

  const stmt = db.prepare(`
    INSERT INTO profiles (id, name, bio, role, interview_types, topics, calendly_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, name, bio, role, interview_types, topics, calendly_url, created_at);

  const created = db.prepare("SELECT * FROM profiles WHERE id = ?").get(id);
  res.status(201).json(created);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
