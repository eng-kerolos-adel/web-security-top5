# 1️⃣ XSS — Cross-Site Scripting

## إيه هي؟
الهاكر بيحقن **JavaScript خبيث** جوه صفحتك (في تعليق، اسم يوزر، query string…). أول ما يوزر تاني يفتح الصفحة، الكود بيشتغل **بصلاحيات موقعك** ويقدر يسرق الـ Session/Tokens، يغيّر الصفحة، أو ينفذ أكشنز باسم الضحية.

## أنواعها
| النوع | الوصف |
|---|---|
| **Stored** | الكود اتخزن في الداتابيز (تعليق مثلاً) وبيضرب كل اللي يفتح الصفحة |
| **Reflected** | الكود جاي من الـ URL ومتعكس في الرد |
| **DOM-based** | الثغرة في كود الـ JS نفسه (`innerHTML`, `document.write`) |

## جرّبها (محليًا)
```bash
npm install
npm run xss:vuln      # http://localhost:3001
```
اكتب في خانة التعليق Payload اختباري زي:
```html
<img src=x onerror="alert(document.cookie)">
```
هتلاقي الـ alert اتفتح وفيه الكوكي → يعني أي سكريبت يقدر يسرقها.

## الحل ✅
```bash
npm run xss:secure    # http://localhost:3002
```
جرّب نفس الـ Payload — هيتعرض كنص عادي مش هيتنفذ.

### طبقات الدفاع (Defense in Depth)
1. **Output Encoding (الأهم):** حوّل `< > " ' &` لـ entities قبل ما تحط الداتا في الـ HTML. (React/Vue/Angular بيعملوها تلقائي — بس خلي بالك من `dangerouslySetInnerHTML` / `v-html` / `[innerHTML]`).
2. **Sanitize لو لازم HTML:** استخدم **DOMPurify** بـ allow-list ضيقة.
3. **CSP:** `Content-Security-Policy` بتمنع inline scripts ومصادر مش مسموحة.
4. **HttpOnly Cookies:** الـ JS مايقدرش يقرا الكوكي.
5. **Validation:** نوع/طول/شكل الـ input (ده مكمّل، مش بديل للـ Encoding).

### في الفرونت إند
```js
// ❌ غلط
el.innerHTML = userInput;
// ✅ صح
el.textContent = userInput;
```
```jsx
// ❌ React
<div dangerouslySetInnerHTML={{ __html: userInput }} />
// ✅ React (لو لازم HTML)
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

## Checklist
- [ ] مفيش `innerHTML` بداتا من اليوزر
- [ ] CSP متفعّلة (من غير `unsafe-inline`)
- [ ] الكوكيز `HttpOnly` + `Secure` + `SameSite`
- [ ] أي HTML من اليوزر بيعدّي على DOMPurify

📚 مراجع: [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
