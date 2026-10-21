// ✅ SECURE — منع الـ framing بالـ Headers.
// Run: npm run clickjacking:secure
//   الضحية: http://localhost:3008
//   الهاكر: http://localhost:4003/?port=3008  (الـ iframe هيتمنع)
const express = require('express');
const path = require('path');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'"); // الحديث والأقوى
  res.setHeader('X-Frame-Options', 'DENY');                            // للمتصفحات القديمة
  next();
});
// لو عايز تسمح لموقعك بس: frame-ancestors 'self'  +  X-Frame-Options: SAMEORIGIN

app.get('/', (req, res) => {
  res.send(`
    <h1>My Account (SECURE)</h1>
    <button style="padding:20px;font-size:18px"
      onclick="document.body.innerHTML='<h1>Account deleted</h1>'">Delete my account</button>`);
});
app.listen(3008, () => console.log('Victim (secure) → http://localhost:3008'));

const attacker = express();
attacker.get('/', (req, res) => res.sendFile(path.join(__dirname, 'attacker.html')));
attacker.listen(4003, () => console.log('Attacker page → http://localhost:4003/?port=3008'));
