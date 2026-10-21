<div align="center">

# 🛡️ أخطر 5 هجمات ويب — بالحل الكودي
### Web Security Masterclass: XSS • SQL Injection • CSRF • Clickjacking • IDOR

![Node](https://img.shields.io/badge/Node.js-%3E%3D18-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Purpose](https://img.shields.io/badge/Purpose-Educational-orange)

**كل هجمة = شرح + كود الثغرة شغال + كود الحل + Checklist**

</div>

---

> ⚠️ **تنبيه مهم:** المشروع ده **للتعليم فقط**. الأكواد `vulnerable.js` متعمّد فيها ثغرات علشان تفهم الهجمة. شغّلها على جهازك (`localhost`) بس، وماتستخدمش أي تقنية هنا ضد أنظمة مش بتاعتك أو من غير إذن صريح.

## 📚 المحتويات

| # | الهجمة | الفولدر | الحل باختصار |
|---|---|---|---|
| 1 | XSS | [`01-xss`](./01-xss) | Output Encoding + DOMPurify + CSP + HttpOnly |
| 2 | SQL Injection | [`02-sql-injection`](./02-sql-injection) | Parameterized Queries / ORM + Least Privilege |
| 3 | CSRF | [`03-csrf`](./03-csrf) | Anti-CSRF Token + SameSite + Origin check |
| 4 | Clickjacking | [`04-clickjacking`](./04-clickjacking) | `frame-ancestors` + `X-Frame-Options` |
| 5 | IDOR | [`05-idor`](./05-idor) | Authorization check على كل Resource |

وكمان في فولدر [`docs`](./docs):
- 📄 [`CHEATSHEET.md`](./docs/CHEATSHEET.md) — ملخص سريع + Headers جاهزة
- ✅ [`SECURITY-CHECKLIST.md`](./docs/SECURITY-CHECKLIST.md) — Checklist قبل الـ Production
- 🔄 [`ATTACK-FLOWS.md`](./docs/ATTACK-FLOWS.md) — رسومات توضح مسار كل هجمة (Mermaid)

## 🚀 التشغيل

```bash
git clone https://github.com/eng-kerolos-adel/web-security-top5.git
cd web-security-top5
npm install
```

كل هجمة ليها نسختين: **vulnerable** (ضعيفة) و **secure** (متأمنة). شغّل واحدة وجرّب الهجوم، وبعدين شغّل التانية وشوف الفرق.

| الهجمة | النسخة الضعيفة | النسخة المتأمنة | البورتات |
|---|---|---|---|
| XSS | `npm run xss:vuln` | `npm run xss:secure` | 3001 / 3002 |
| SQLi | `npm run sqli:vuln` | `npm run sqli:secure` | 3003 / 3004 |
| CSRF | `npm run csrf:vuln` | `npm run csrf:secure` | 3005 (+4000) / 3006 (+4001) |
| Clickjacking | `npm run clickjacking:vuln` | `npm run clickjacking:secure` | 3007 (+4002) / 3008 (+4003) |
| IDOR | `npm run idor:vuln` | `npm run idor:secure` | 3009 / 3010 |

> المطلوب: **Node.js 18+**. لازم تقفل السيرفر (`Ctrl+C`) قبل ما تشغّل نسخة تانية على نفس البورت.

## 🧠 ملخص الهجمات

### 1) XSS
الهاكر يحقن JavaScript في صفحتك فيتنفذ عند يوزر تاني ويسرق الـ Session. **الحل:** Escape/Encode للـ output، DOMPurify لو محتاج HTML، CSP، وكوكيز HttpOnly. [التفاصيل ←](./01-xss/README.md)

### 2) SQL Injection
مدخلات اليوزر بتتلزق في الـ Query فتتحول لكود SQL. **الحل:** Parameterized Queries أو ORM، وصلاحيات قليلة لليوزر بتاع الداتابيز. [التفاصيل ←](./02-sql-injection/README.md)

### 3) CSRF
الموقع الخبيث بيخلي متصفح الضحية يبعت طلب لموقعك بكوكيزه. **الحل:** Anti-CSRF Tokens، `SameSite`، والتحقق من الـ Origin. [التفاصيل ←](./03-csrf/README.md)

### 4) Clickjacking
موقعك جوه iframe شفاف والضحية بيدوس من غير ما يعرف. **الحل:** `Content-Security-Policy: frame-ancestors 'none'` + `X-Frame-Options: DENY`. [التفاصيل ←](./04-clickjacking/README.md)

### 5) IDOR
تغيير الـ ID في اللينك بيكشف داتا غيرك. **الحل:** تتأكد جوه الـ Controller إن اليوزر الحالي ليه صلاحية على الـ Resource، وماتعتمدش على الـ ID لوحده. [التفاصيل ←](./05-idor/README.md)

## 🗂️ هيكل المشروع

```
web-security-top5/
├── README.md
├── LICENSE
├── package.json
├── .gitignore
├── 01-xss/
│   ├── README.md
│   ├── vulnerable.js
│   └── secure.js
├── 02-sql-injection/
│   ├── README.md
│   ├── vulnerable.js
│   └── secure.js
├── 03-csrf/
│   ├── README.md
│   ├── attacker.html
│   ├── vulnerable.js
│   └── secure.js
├── 04-clickjacking/
│   ├── README.md
│   ├── attacker.html
│   ├── vulnerable.js
│   └── secure.js
├── 05-idor/
│   ├── README.md
│   ├── vulnerable.js
│   └── secure.js
└── docs/
    ├── CHEATSHEET.md
    ├── SECURITY-CHECKLIST.md
    └── ATTACK-FLOWS.md
```

## 🧩 فكرة "Defense in Depth"

مفيش حماية واحدة كفاية. الأمان الحقيقي = **طبقات**:

1. **امنع** الثغرة من المصدر (Encoding, Parameterization, Authorization).
2. **قلّل الضرر** لو حصلت (CSP, HttpOnly, Least Privilege).
3. **اكتشف** بسرعة (Logging, Monitoring, Alerts).
4. **اختبر** باستمرار (Unit/Integration tests, `npm audit`, Code Review).

## 📖 مراجع للتعمق

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security) (مجاني، فيه labs عملية)
- [MDN — Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

## ⚠️ حدود المشروع

- الأكواد ديمو مبسّط (sessions in-memory, بدون HTTPS, بدون rate limiting) — **مش** قالب جاهز للـ production.
- فعّل `secure: true` على الكوكيز وشغّل الموقع على HTTPS في الإنتاج.
- الحماية مش بتغني عن Pen-testing ومراجعات أمنية دورية.

## 🤝 المساهمة
أي Pull Request بيحسّن الشرح أو بيضيف أمثلة (Django / Laravel / Spring / ASP.NET…) مرحّب بيه.

## 📬 تواصل
لو المشروع أفادك، اعمله ⭐ على GitHub وشاركه مع زمايلك. **KeroCodes** 💻

## 📄 الترخيص
[MIT](./LICENSE)
