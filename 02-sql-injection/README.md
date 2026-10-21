# 2️⃣ SQL Injection (SQLi)

## إيه هي؟
لما تلزق مدخلات اليوزر جوه Query كـ String، الهاكر يكتب **كود SQL** بدل البيانات. النتيجة: تخطي اللوجين، سرقة الداتا، تعديل/مسح جداول.

```sql
-- الكود الأصلي
SELECT * FROM users WHERE username = '$user' AND password = '$pass'
-- لو username = admin'--  بيبقى:
SELECT * FROM users WHERE username = 'admin'--' AND password = '...'
-- (-- بيعمل comment لباقي الـ Query → دخل من غير باسورد)
```

## جرّبها
```bash
npm install
npm run sqli:vuln     # http://localhost:3003
```
جرّب في المتصفح:
```
http://localhost:3003/login?username=admin'--&password=x
```
هتدخل كـ admin من غير الباسورد الصح. بص على الـ Terminal هتلاقي الـ SQL اللي اتنفذ.

## الحل ✅
```bash
npm run sqli:secure   # http://localhost:3004  (POST /login بـ JSON)
```
```bash
# Payload الهجوم بيتعامل معاه كنص عادي → Invalid credentials
curl -X POST http://localhost:3004/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin'--\",\"password\":\"x\"}"

# لوجين صح
curl -X POST http://localhost:3004/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"alice\",\"password\":\"alice123\"}"
```

### طبقات الدفاع
1. **Parameterized Queries / Prepared Statements** — الحل الأساسي، الداتا والكود منفصلين.
2. **ORM** (Prisma / Sequelize / TypeORM / Mongoose) — بيعمل parameterization تلقائي، **بس** خلي بالك من الـ raw queries.
3. **Least Privilege** — يوزر الداتابيز يكون ليه أقل صلاحيات (مفيش `DROP`/`ALTER` للتطبيق).
4. **Validation** — النوع والطول والشكل (allow-list).
5. **Hash الباسوردات** (bcrypt/argon2/scrypt) — حتى لو اتسربت الداتا.
6. **ماتعرضش تفاصيل الأخطاء** لليوزر — سجّلها في اللوج بس.

### أمثلة بمكتبات تانية
```js
// PostgreSQL (node-postgres)
await pool.query('SELECT * FROM users WHERE email = $1', [email]);

// MySQL2
await conn.execute('SELECT * FROM users WHERE email = ?', [email]);

// Prisma ✅
await prisma.user.findUnique({ where: { email } });
// Prisma raw ✅ (tagged template = parameterized)
await prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${email}`;
// Prisma raw ❌ (ماتستخدمش Unsafe مع input من اليوزر)
await prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE email = '${email}'`);

// Mongoose / NoSQL Injection ✅ — اتأكد إن الـ input String مش Object
if (typeof req.body.email !== 'string') return res.sendStatus(400);
await User.findOne({ email: req.body.email });
```

## Checklist
- [ ] مفيش string concatenation في أي Query
- [ ] كل الـ raw queries Parameterized
- [ ] يوزر الداتابيز بأقل صلاحيات
- [ ] الباسوردات Hashed
- [ ] الأخطاء مش بتتعرض لليوزر

📚 مراجع: [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
