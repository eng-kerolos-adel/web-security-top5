// ⚠️ VULNERABLE — للتعليم فقط. شغّله على جهازك بس.
// Run: npm run xss:vuln  →  http://localhost:3001
const express = require('express');
const app = express();
const comments = [];

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  // سيشن تجريبية "مش HttpOnly" علشان نوضح خطر سرقتها بالـ JS
  res.cookie('session', 'demo-session-token-123');
  res.send(`
    <h1>Comments (VULNERABLE)</h1>
    <form method="POST" action="/comment">
      <input name="text" placeholder="اكتب تعليق" size="50" />
      <button>Send</button>
    </form>
    <ul>${comments.map((c) => `<li>${c}</li>`).join('')}</ul>
  `); // ❌ الداتا بتتحط في الـ HTML زي ما هي
});

app.post('/comment', (req, res) => {
  comments.push(req.body.text); // ❌ مفيش Sanitize ولا Escape
  res.redirect('/');
});

app.listen(3001, () => console.log('XSS vulnerable → http://localhost:3001'));
