// ⚠️ VULNERABLE — بنك تجريبي بدون حماية CSRF.
// Run: npm run csrf:vuln
//   البنك:   http://localhost:3005   (اعمل /login الأول)
//   الهاكر:  http://localhost:4000   (صفحة attacker.html)
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const sessions = {}; // sid -> username
const balances = { alice: 1000, attacker: 0 };

app.get('/login', (req, res) => {
  const sid = crypto.randomBytes(16).toString('hex');
  sessions[sid] = 'alice';
  res.cookie('sid', sid, { httpOnly: true }); // ❌ مفيش SameSite صريح
  res.redirect('/');
});

app.get('/', (req, res) => {
  const user = sessions[req.cookies.sid];
  if (!user) return res.send('<a href="/login">Login as alice</a>');
  res.send(`
    <h1>Bank (VULNERABLE) — ${user}</h1>
    <p>Balance: $${balances[user]} | Attacker balance: $${balances.attacker}</p>
    <form method="POST" action="/transfer">
      <input name="to" value="bob" /> <input name="amount" value="10" />
      <button>Transfer</button>
    </form>`);
});

app.post('/transfer', (req, res) => {
  const user = sessions[req.cookies.sid];
  if (!user) return res.status(401).send('Not logged in');
  const amount = Number(req.body.amount);
  const to = req.body.to;
  // ❌ مفيش CSRF token ولا Origin check
  if (!(amount > 0) || amount > balances[user]) return res.status(400).send('Invalid');
  balances[user] -= amount;
  balances[to] = (balances[to] || 0) + amount;
  console.log(`Transfer ${amount} from ${user} to ${to}`);
  res.redirect('/');
});

app.listen(3005, () => console.log('Bank (vulnerable) → http://localhost:3005'));

// سيرفر "الهاكر" — موقع تاني (origin مختلف) بيستضيف الصفحة الخبيثة
const attacker = express();
attacker.get('/', (req, res) => res.sendFile(path.join(__dirname, 'attacker.html')));
attacker.listen(4000, () => console.log('Attacker page → http://localhost:4000'));
