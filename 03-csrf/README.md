# 3️⃣ CSRF — Cross-Site Request Forgery

## إيه هي؟
اليوزر عامل Login في موقعك. الهاكر يبعتله لينك/صفحة خبيثة، فالمتصفح **بيبعت الكوكيز تلقائي** مع الطلب لموقعك → الهاكر ينفذ أكشنز باسم اليوزر (تحويل فلوس، تغيير إيميل/باسورد…) من غير ما يعرف الكوكي نفسها.

## جرّبها
```bash
npm install
npm run csrf:vuln
```
1. افتح `http://localhost:3005/login` (بتدخل كـ alice).
2. في تاب تاني افتح `http://localhost:4000` (صفحة الهاكر) واضغط الزرار.
3. ارجع لـ `http://localhost:3005` → الرصيد نقص 500 والهاكر استلمهم.

> ملحوظة: المتصفحات الحديثة بتعتبر `SameSite=Lax` افتراضي، لكن `localhost:3005` و`localhost:4000` **Same-Site** (البورت مش بيفرّق)، علشان كده الهجوم بيشتغل في الديمو. في الواقع الهجوم بيبقى من دومين مختلف، والـ SameSite بيساعد كطبقة أولى بس **مش كفاية لوحده** (مثلاً مع subdomains أو GET بيغيّر state).

## الحل ✅
```bash
npm run csrf:secure
```
1. `http://localhost:3006/login` ← بعدين اعمل تحويل عادي من الفورم (✅ بيشتغل).
2. افتح `http://localhost:4001` واضغط (❌ بيترفض: 403).

### طبقات الدفاع
1. **Anti-CSRF Token** (Synchronizer Token) مع كل طلب بيغيّر حاجة (POST/PUT/PATCH/DELETE).
2. **`SameSite=Strict`** (أو `Lax`) على الـ session cookie.
3. **Origin/Referer verification** على الطلبات الحساسة.
4. **ماتغيّرش State بـ GET أبدًا.**
5. **Re-authentication** للعمليات الحساسة (تحويل فلوس، تغيير باسورد).
6. لو API بـ JWT في header (`Authorization: Bearer`) بدل كوكيز → CSRF مش بتأثر (بس XSS ممكن تسرق الـ token، فاحذر من LocalStorage).

### مثال Express بمكتبة جاهزة
> مكتبة `csurf` اتوقف تطويرها، الأفضل `csrf-csrf` أو `lusca` أو تنفّذها زي الديمو.
```js
import { doubleCsrf } from 'csrf-csrf';
const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: '__Host-csrf',
  cookieOptions: { sameSite: 'strict', secure: true, httpOnly: true },
});
app.use(doubleCsrfProtection);
```

## Checklist
- [ ] Token على كل Form وكل طلب AJAX بيغيّر state
- [ ] كوكيز بـ `SameSite` + `HttpOnly` + `Secure`
- [ ] Origin check على الطلبات الحساسة
- [ ] مفيش GET بيعمل تعديل

📚 مراجع: [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
