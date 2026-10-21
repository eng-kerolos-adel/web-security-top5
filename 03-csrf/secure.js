// ✅ SECURE — نفس البنك بحماية CSRF متعددة الطبقات.
// Run: npm run csrf:secure
//   البنك:   http://localhost:3006
//   الهاكر:  http://localhost:4001 (بيحاول يضرب 3006)
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const sessions = {}; // sid -> { user, csrf }
const balances = { alice: 1000, attacker: 0 };
const ALLOWED_ORIGIN = 'http://localhost:3006';

app.get('/login', (req, res) => {
  const sid = crypto.randomBytes(16).toString('hex');
  sessions[sid] = { user: 'alice', csrf: crypto.randomBytes(32).toString('hex') };
  res.cookie('sid', sid, {
    httpOnly: true,
    sameSite: 'strict', // 1) الكوكي مبتتبعتش في الطلبات Cross-site
    // secure: true,    // فعّلها في الـ production
  });
  res.redirect('/');
});

app.get('/', (req, res) => {
  const s = sessions[req.cookies.sid];
  if (!s) return res.send('<a href="/login">Login as alice</a>');
  res.send(`
    <h1>Bank (SECURE) — ${s.user}</h1>
    <p>Balance: $${balances[s.user]} | Attacker balance: $${balances.attacker}</p>
    <form method="POST" action="/transfer">
      <input type="hidden" name="_csrf" value="${s.csrf}" />
      <input name="to" value="bob" /> <input name="amount" value="10" />
      <button>Transfer</button>
    </form>`);
});

// Middleware الحماية
function csrfProtection(req, res, next) {
  const s = sessions[req.cookies.sid];
  if (!s) return res.status(401).send('Not logged in');

  // 2) Origin/Referer check
  const origin = req.get('origin') || req.get('referer') || '';
  if (!origin.startsWith(ALLOWED_ORIGIN)) return res.status(403).send('Bad origin');

  // 3) Anti-CSRF token (Synchronizer Token) — مقارنة ثابتة الوقت
  const sent = Buffer.from(String(req.body._csrf || ''));
  const real = Buffer.from(s.csrf);
  if (sent.length !== real.length || !crypto.timingSafeEqual(sent, real)) {
    return res.status(403).send('Invalid CSRF token');
  }
  req.session = s;
  next();
}

app.post('/transfer', csrfProtection, (req, res) => {
  const user = req.session.user;
  const amount = Number(req.body.amount);
  const to = String(req.body.to);
  if (!(amount > 0) || amount > balances[user]) return res.status(400).send('Invalid');
  balances[user] -= amount;
  balances[to] = (balances[to] || 0) + amount;
  res.redirect('/');
});

app.listen(3006, () => console.log('Bank (secure) → http://localhost:3006'));

// صفحة الهاكر بتحاول تضرب النسخة المتأمنة
const attacker = express();
attacker.get('/', (req, res) => {
  res.send(`<h1>🎁 جايزة</h1>
  <form id="evil" method="POST" action="http://localhost:3006/transfer">
    <input type="hidden" name="to" value="attacker" />
    <input type="hidden" name="amount" value="500" />
  </form>
  <button onclick="document.getElementById('evil').submit()">استلم</button>`);
});
attacker.listen(4001, () => console.log('Attacker page → http://localhost:4001'));
