// ⚠️ VULNERABLE — للتعليم فقط.
// Run: npm run sqli:vuln  →  http://localhost:3003
const express = require('express');
const Database = require('better-sqlite3');

const db = new Database(':memory:');
db.exec(`
  CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT);
  INSERT INTO users (username, password, role) VALUES
    ('admin', 'S3cr3t!Pass', 'admin'),
    ('alice', 'alice123', 'user');
`);

const app = express();

app.get('/', (req, res) => {
  res.send(`
    <h1>Login (VULNERABLE)</h1>
    <form method="GET" action="/login">
      <input name="username" placeholder="username" />
      <input name="password" placeholder="password" />
      <button>Login</button>
    </form>`);
});

app.get('/login', (req, res) => {
  const { username = '', password = '' } = req.query;

  // ❌ لصق الـ String مباشرة في الـ Query
  const sql = `SELECT id, username, role FROM users
               WHERE username = '${username}' AND password = '${password}'`;
  console.log('SQL:', sql);

  try {
    const user = db.prepare(sql).get();
    if (user) return res.json({ ok: true, user });
    res.status(401).json({ ok: false, message: 'Invalid credentials' });
  } catch (err) {
    // ❌ كمان بنسرّب تفاصيل الخطأ
    res.status(500).json({ error: err.message, sql });
  }
});

app.listen(3003, () => console.log('SQLi vulnerable → http://localhost:3003'));
