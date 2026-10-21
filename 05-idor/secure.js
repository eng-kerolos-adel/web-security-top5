// ✅ SECURE — Authorization check على كل Resource.
// Run: npm run idor:secure  →  http://localhost:3010
const express = require('express');
const crypto = require('crypto');
const app = express();

const tokens = { 'alice-token': { id: 1, role: 'user' }, 'bob-token': { id: 2, role: 'user' }, 'admin-token': { id: 3, role: 'admin' } };

// بدل IDs متسلسلة (1,2,3) استخدم UUIDs غير متوقعة (دي طبقة إضافية مش بديل للـ check)
const invoices = [
  { id: crypto.randomUUID(), ownerId: 1, item: 'Laptop', amount: 1200 },
  { id: crypto.randomUUID(), ownerId: 2, item: 'Phone', amount: 800 },
  { id: crypto.randomUUID(), ownerId: 3, item: 'Admin secret contract', amount: 99999 },
];

function auth(req, res, next) {
  const user = tokens[(req.get('authorization') || '').replace('Bearer ', '')];
  if (!user) return res.status(401).json({ error: 'Unauthenticated' });
  req.user = user;
  next();
}

// ✅ Policy واضحة ومركزية
const canViewInvoice = (user, invoice) => user.role === 'admin' || invoice.ownerId === user.id;

app.get('/api/invoices/:id', auth, (req, res) => {
  const invoice = invoices.find((i) => i.id === req.params.id);
  // ✅ 404 موحدة سواء مش موجود أو مش بتاعك (مانكشفش وجود الـ Resource)
  if (!invoice || !canViewInvoice(req.user, invoice)) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(invoice);
});

// ✅ الأفضل: خلّي الـ Query نفسها مقيّدة باليوزر الحالي
app.get('/api/my/invoices', auth, (req, res) => {
  res.json(invoices.filter((i) => i.ownerId === req.user.id));
});

app.listen(3010, () => console.log('IDOR secure → http://localhost:3010'));
