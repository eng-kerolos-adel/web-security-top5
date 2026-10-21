// ✅ SECURE
// Run: npm run sqli:secure  →  http://localhost:3004
const express = require('express');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const db = new Database(':memory:');
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL
  );
`);

// تخزين الباسوردات بـ Hash (scrypt) — مش plain text أبدًا
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}
const seed = db.prepare(
  'INSERT INTO users (username, salt, password_hash, role) VALUES (?, ?, ?, ?)'
);
for (const [u, p, r] of [['admin', 'S3cr3t!Pass', 'admin'], ['alice', 'alice123', 'user']]) {
  const { salt, hash } = hashPassword(p);
  seed.run(u, salt, hash, r);
}

const app = express();
app.use(express.json());

app.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  // 1) Validation: لازم Strings وبطول معقول
  if (typeof username !== 'string' || typeof password !== 'string' ||
      username.length > 64 || password.length > 128) {
    return res.status(400).json({ ok: false, message: 'Bad input' });
  }

  // 2) Parameterized Query: الداتا مش بتتفسر كـ SQL أبدًا
  const user = db
    .prepare('SELECT id, username, role, salt, password_hash FROM users WHERE username = ?')
    .get(username);

  // 3) رسالة موحدة + مقارنة ثابتة الوقت
  const fail = () => res.status(401).json({ ok: false, message: 'Invalid credentials' });
  if (!user) return fail();
  const { hash } = hashPassword(password, user.salt);
  const ok = crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.password_hash, 'hex'));
  if (!ok) return fail();

  res.json({ ok: true, user: { id: user.id, username: user.username, role: user.role } });
});

app.listen(3004, () => console.log('SQLi secure → http://localhost:3004'));
