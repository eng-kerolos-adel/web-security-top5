# 🛡️ Web Security Cheat Sheet — Top 5

| الهجمة | الفكرة | الحل الأساسي | حماية إضافية |
|---|---|---|---|
| **XSS** | حقن JS في صفحتك | Output Encoding + DOMPurify | CSP, HttpOnly cookies |
| **SQLi** | حقن SQL في الـ Query | Parameterized Queries / ORM | Least privilege, Hashing, Validation |
| **CSRF** | استغلال كوكيز اليوزر | Anti-CSRF Token | SameSite, Origin check, no state-change GET |
| **Clickjacking** | iframe شفاف | `frame-ancestors 'none'` | `X-Frame-Options: DENY` |
| **IDOR** | تغيير الـ ID للوصول لداتا غيرك | Authorization check لكل Resource | Query بالـ owner, UUID, Tests |

## Headers جاهزة
```http
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Cookie آمنة
```js
res.cookie('sid', value, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3600_000 });
```

## Snippets سريعة
```js
// XSS
el.textContent = userInput;                         // بدل innerHTML
clean = DOMPurify.sanitize(dirty);

// SQLi
db.query('SELECT * FROM users WHERE id = $1', [id]);

// CSRF
if (!timingSafeEqual(sentToken, sessionToken)) return res.sendStatus(403);

// IDOR
const doc = await Doc.findOne({ _id: req.params.id, owner: req.user.id });
if (!doc) return res.sendStatus(404);
```
