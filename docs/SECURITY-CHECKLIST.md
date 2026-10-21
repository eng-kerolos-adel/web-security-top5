# ✅ Production Security Checklist

## Input / Output
- [ ] كل Output بيتعمله Encoding حسب السياق (HTML / Attribute / JS / URL)
- [ ] أي HTML من اليوزر → DOMPurify بـ allow-list
- [ ] Validation على السيرفر (النوع، الطول، الشكل) — مش في الفرونت بس

## Database
- [ ] صفر string concatenation في الـ queries
- [ ] يوزر الداتابيز بأقل صلاحيات
- [ ] الباسوردات: argon2id / bcrypt / scrypt
- [ ] الأخطاء التفصيلية في اللوج مش في الـ response

## Sessions & Cookies
- [ ] `HttpOnly` + `Secure` + `SameSite`
- [ ] Anti-CSRF Token على الطلبات اللي بتغيّر state
- [ ] Session بتتجدد (rotate) بعد اللوجين
- [ ] Timeout مناسب + Logout بيلغي الـ session من السيرفر

## Headers
- [ ] CSP بدون `unsafe-inline`
- [ ] `frame-ancestors` + `X-Frame-Options`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] HSTS

## Access Control
- [ ] Authentication + **Authorization** على كل endpoint
- [ ] الـ owner بيتاخد من الـ session مش من الـ request
- [ ] اختبارات "يوزر A ضد داتا يوزر B"
- [ ] Rate limiting على اللوجين والـ APIs الحساسة

## Process
- [ ] `npm audit` / Dependabot
- [ ] Code review فيه بند Security
- [ ] Logging + Monitoring + Alerts
