// ✅ SECURE — نفس التطبيق بس متأمن.
// Run: npm run xss:secure  →  http://localhost:3002
const express = require('express');
const crypto = require('crypto');
const DOMPurify = require('isomorphic-dompurify');

const app = express();
const comments = []; // { text, html }

app.use(express.urlencoded({ extended: false }));

// 1) Output Encoding: حوّل الرموز الخطرة لـ entities
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 2) CSP: حتى لو حصل اختراق، المتصفح يمنع inline scripts
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`
  );
  next();
});

app.get('/', (req, res) => {
  // 3) الكوكي HttpOnly: الـ JS مايقدرش يقراها حتى لو XSS حصلت
  res.cookie('session', 'demo-session-token-123', {
    httpOnly: true,
    sameSite: 'strict',
    // secure: true  // فعّلها في الـ production (HTTPS)
  });
  res.send(`
    <h1>Comments (SECURE)</h1>
    <form method="POST" action="/comment">
      <input name="text" placeholder="اكتب تعليق" size="50" />
      <label><input type="checkbox" name="rich" value="1" /> Allow basic formatting (b, i, a)</label>
      <button>Send</button>
    </form>
    <ul>${comments.map((c) => `<li>${c}</li>`).join('')}</ul>
  `);
});

app.post('/comment', (req, res) => {
  const raw = String(req.body.text || '').slice(0, 500); // Validation: طول أقصى
  let safe;
  if (req.body.rich) {
    // لو لازم HTML (rich text) استخدم DOMPurify بقائمة سماح ضيقة
    safe = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href'],
    });
  } else {
    safe = escapeHtml(raw); // الافتراضي: نص عادي = Escape
  }
  comments.push(safe);
  res.redirect('/');
});

app.listen(3002, () => console.log('XSS secure → http://localhost:3002'));
