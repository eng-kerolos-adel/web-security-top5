// ⚠️ VULNERABLE — صفحة ممكن تتحط في iframe.
// Run: npm run clickjacking:vuln
//   الضحية: http://localhost:3007
//   الهاكر: http://localhost:4002  (?port=3007)
const express = require('express');
const path = require('path');

const app = express();
app.get('/', (req, res) => {
  // ❌ مفيش X-Frame-Options ولا frame-ancestors
  res.send(`
    <h1>My Account (VULNERABLE)</h1>
    <button id="del" style="padding:20px;font-size:18px"
      onclick="document.body.innerHTML='<h1>💥 Account deleted!</h1>'">
      Delete my account
    </button>`);
});
app.listen(3007, () => console.log('Victim (vulnerable) → http://localhost:3007'));

startAttacker();

function startAttacker() {
  const attacker = express();
  attacker.get('/', (req, res) => res.sendFile(path.join(__dirname, 'attacker.html')));
  attacker.listen(4002, () => console.log('Attacker page → http://localhost:4002/?port=3007'));
}
