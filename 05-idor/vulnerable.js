// ⚠️ VULNERABLE — API بيعتمد على الـ ID بس.
// Run: npm run idor:vuln  →  http://localhost:3009
const express = require('express');
const app = express();

const tokens = { 'alice-token': { id: 1, role: 'user' }, 'bob-token': { id: 2, role: 'user' }, 'admin-token': { id: 3, role: 'admin' } };
const invoices = [
  { id: 1, ownerId: 1, item: 'Laptop', amount: 1200 },
  { id: 2, ownerId: 2, item: 'Phone', amount: 800 },
  { id: 3, ownerId: 3, item: 'Admin secret contract', amount: 99999 },
];

// Authentication بس (عارفين مين اليوزر)
function auth(req, res, next) {
  const user = tokens[(req.get('authorization') || '').replace('Bearer ', '')];
  if (!user) return res.status(401).json({ error: 'Unauthenticated' });
  req.user = user;
  next();
}

app.get('/api/invoices/:id', auth, (req, res) => {
  const invoice = invoices.find((i) => i.id === Number(req.params.id));
  if (!invoice) return res.status(404).json({ error: 'Not found' });
  // ❌ مفيش Authorization: مش بنتأكد إن الفاتورة بتاعت اليوزر ده
  res.json(invoice);
});

app.listen(3009, () => console.log('IDOR vulnerable → http://localhost:3009'));
