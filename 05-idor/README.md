# 5️⃣ IDOR — Insecure Direct Object Reference

> بتندرج تحت **Broken Access Control** — المركز الأول في OWASP Top 10.

## إيه هي؟
التطبيق بيستخدم ID جاي من اليوزر (`/invoices/5`) ومابيتأكدش إن اليوزر **ليه صلاحية** على الـ Resource دي. الهاكر يغيّر الرقم → يشوف/يعدّل/يمسح بيانات يوزرز تانيين أو الأدمن.

## جرّبها
```bash
npm install
npm run idor:vuln
```
Alice (id=1) بتشوف فاتورتها عادي:
```bash
curl -H "Authorization: Bearer alice-token" http://localhost:3009/api/invoices/1
```
بس تقدر تغيّر الرقم وتشوف فواتير غيرها (حتى بتاعة الأدمن):
```bash
curl -H "Authorization: Bearer alice-token" http://localhost:3009/api/invoices/2
curl -H "Authorization: Bearer alice-token" http://localhost:3009/api/invoices/3
```

## الحل ✅
```bash
npm run idor:secure
```
هات فواتير أليس (والـ UUID بتاعها) من الـ endpoint ده:
```bash
curl -H "Authorization: Bearer alice-token" http://localhost:3010/api/my/invoices
# جرّب تفتح فاتورة بوب بتوكن أليس → 404
```

### طبقات الدفاع
1. **Authorization check على كل Resource** (مش الـ Authentication بس!) جوه الـ Controller/Service.
2. **Query مقيّدة بالـ owner:** `WHERE id = ? AND owner_id = ?`.
3. **Policy مركزية** (Middleware/Policy classes/RBAC/ABAC) بدل if-else متفرقة.
4. **UUIDs/Random IDs** بدل متسلسلة (إخفاء مش حماية — مكمّل للـ check).
5. **404 موحدة** بدل 403 علشان ماتكشفش وجود الـ Resource.
6. **اختبارات أوتوماتيك:** يوزر A يحاول يوصل لـ Resource بتاعة يوزر B → لازم يفشل.
7. **ماتثقش في الـ userId الجاي من الـ body/URL** — خده دايمًا من الـ session/token.

### مثال بـ Prisma
```js
// ❌
const invoice = await prisma.invoice.findUnique({ where: { id } });
// ✅
const invoice = await prisma.invoice.findFirst({ where: { id, ownerId: req.user.id } });
if (!invoice) return res.sendStatus(404);
```

### مثال Test بـ Jest + Supertest
```js
it('user cannot read another user\'s invoice', async () => {
  const res = await request(app)
    .get(`/api/invoices/${bobInvoiceId}`)
    .set('Authorization', 'Bearer alice-token');
  expect(res.status).toBe(404);
});
```

## Checklist
- [ ] كل endpoint فيه Authorization check
- [ ] الـ queries مقيّدة بالـ owner
- [ ] الـ ownerId بيتاخد من الـ session مش من الـ request
- [ ] فيه اختبارات لسيناريوهات الوصول لبيانات يوزر تاني

📚 مراجع: [OWASP IDOR Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
