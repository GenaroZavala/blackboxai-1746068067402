const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Secret key for JWT
const SECRET_KEY = 'your_secret_key';

// In-memory data stores (for simplicity)
let users = [
  { id: 1, username: 'admin', password: 'adminpass', role: 'admin', shares: {} },
  { id: 2, username: 'user1', password: 'userpass', role: 'user', shares: {} }
];

let companies = [
  // Example company
  // { id: 1, name: 'Company A', sharesAvailable: 1000, price: 100 }
];

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
}

// Routes

// User login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY);
  res.json({ token, role: user.role });
});

// Get companies (public)
app.get('/api/companies', (req, res) => {
  res.json(companies);
});

// Admin: Add company
app.post('/api/admin/companies', authenticateToken, isAdmin, (req, res) => {
  const { name, sharesAvailable, price } = req.body;
  if (!name || sharesAvailable == null || price == null) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const id = companies.length ? companies[companies.length - 1].id + 1 : 1;
  companies.push({ id, name, sharesAvailable, price });
  res.json({ message: 'Company added', company: { id, name, sharesAvailable, price } });
});

// Admin: Remove company
app.delete('/api/admin/companies/:id', authenticateToken, isAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const index = companies.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ message: 'Company not found' });
  companies.splice(index, 1);
  res.json({ message: 'Company removed' });
});

// Admin: Update shares available
app.put('/api/admin/companies/:id/shares', authenticateToken, isAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const { sharesAvailable } = req.body;
  const company = companies.find(c => c.id === id);
  if (!company) return res.status(404).json({ message: 'Company not found' });
  if (sharesAvailable == null) return res.status(400).json({ message: 'Missing sharesAvailable' });
  company.sharesAvailable = sharesAvailable;
  res.json({ message: 'Shares updated', company });
});

// User: Buy shares
app.post('/api/buy', authenticateToken, (req, res) => {
  const { companyId, quantity } = req.body;
  if (!companyId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid companyId or quantity' });
  }
  const company = companies.find(c => c.id === companyId);
  if (!company) return res.status(404).json({ message: 'Company not found' });
  if (company.sharesAvailable < quantity) {
    return res.status(400).json({ message: 'Not enough shares available' });
  }

  // Deduct shares from company
  company.sharesAvailable -= quantity;

  // Assign shares to user
  const user = users.find(u => u.id === req.user.id);
  if (!user.shares[companyId]) user.shares[companyId] = 0;
  user.shares[companyId] += quantity;

  // AI logic to determine price change
  // Simple heuristic: price changes by a random percentage between -5% and +5%
  const changePercent = (Math.random() * 10) - 5;
  const changeAmount = company.price * (changePercent / 100);
  company.price = Math.max(1, +(company.price + changeAmount).toFixed(2)); // price can't go below 1

  res.json({
    message: 'Shares purchased',
    company: { id: company.id, name: company.name, price: company.price, sharesAvailable: company.sharesAvailable },
    userShares: user.shares[companyId]
  });
});

// User: Get portfolio
app.get('/api/portfolio', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const portfolio = Object.entries(user.shares).map(([companyId, quantity]) => {
    const company = companies.find(c => c.id === parseInt(companyId));
    return {
      companyId: parseInt(companyId),
      companyName: company ? company.name : 'Unknown',
      quantity,
      currentPrice: company ? company.price : 0
    };
  });
  res.json({ portfolio });
});

// Start server
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
