const express = require('express');
const { accounts, balances, transactions } = require('../data/accounts');

const router = express.Router();

function requireAuth(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization header',
    });
  }
  next();
}

// GET /v3/accounts
router.get('/', requireAuth, (req, res) => {
  res.json({ accounts });
});

// GET /v3/accounts/:accountId/balances
router.get('/:accountId/balances', requireAuth, (req, res) => {
  const { accountId } = req.params;
  const accountBalances = balances[accountId];
  if (!accountBalances) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Account not found' });
  }
  res.json({ balances: accountBalances });
});

// GET /v3/accounts/:accountId/transactions
router.get('/:accountId/transactions', requireAuth, (req, res) => {
  const { accountId } = req.params;
  const accountTransactions = transactions[accountId];
  if (!accountTransactions) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Account not found' });
  }
  res.json({ transactions: accountTransactions });
});

module.exports = router;
