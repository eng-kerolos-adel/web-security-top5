# 4️⃣ Clickjacking (UI Redressing)

## إيه هي؟
الهاكر بيحط موقعك جوه **iframe شفاف** فوق زرار طُعم (مثلاً "اكسب آيفون"). اليوزر فاكر إنه بيدوس على حاجة، وهو فعليًا بيدوس على زرار في موقعك (حذف حساب، تحويل، Like…).

## جرّبها
```bash
npm install
npm run clickjacking:vuln
```
افتح `http://localhost:4002/?port=3007&debug=1` (الـ debug بيخلي الـ iframe نصف شفاف علشان تشوف الخدعة). شيل `debug=1` وهتلاقي الزرار الطُعم بس، وأي ضغطة بتروح لموقع الضحية.

## الحل ✅
```bash
npm run clickjacking:secure
```
افتح `http://localhost:4003/?port=3008` → المتصفح بيرفض يعرض الـ iframe.

### الـ Headers
| Header | القيمة | المعنى |
|---|---|---|
| `Content-Security-Policy` | `frame-ancestors 'none'` | ممنوع أي framing (**الأفضل**) |
| `Content-Security-Policy` | `frame-ancestors 'self'` | مسموح لنفس الـ origin بس |
| `Content-Security-Policy` | `frame-ancestors https://partner.com` | مسموح لدومين محدد |
| `X-Frame-Options` | `DENY` / `SAMEORIGIN` | للمتصفحات القديمة (fallback) |

### Express + Helmet (الطريقة الأسهل)
```js
import helmet from 'helmet';
app.use(helmet({
  frameguard: { action: 'deny' },
  contentSecurityPolicy: { directives: { frameAncestors: ["'none'"] } },
}));
```

### Nginx
```nginx
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "frame-ancestors 'none'" always;
```

### Apache
```apache
Header always set X-Frame-Options "DENY"
Header always set Content-Security-Policy "frame-ancestors 'none'"
```

### Next.js (`next.config.js`)
```js
module.exports = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
      ],
    }];
  },
};
```

> ⚠️ الـ Frame-busting JavaScript (`if (top !== self) ...`) **مش حماية كافية** — استخدم الـ Headers.
> ⚠️ `X-Frame-Options` و`frame-ancestors` لازم يتبعتوا كـ **HTTP header**، مش `<meta>`.

## Checklist
- [ ] `frame-ancestors` متظبطة على كل الصفحات
- [ ] `X-Frame-Options` كـ fallback
- [ ] لو محتاج تسمح بـ embed، حدد الدومينات بالاسم (مش `*`)
- [ ] الأكشنز الحساسة محتاجة تأكيد إضافي (re-auth)

📚 مراجع: [OWASP Clickjacking Defense](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html)
