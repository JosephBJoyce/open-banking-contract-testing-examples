const express = require('express');
const { payments } = require('../data/payments');

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

// POST /v1/payments/sepa-credit-transfers
router.post('/', requireAuth, (req, res) => {
  const { creditorAccount, creditorName, instructedAmount, remittanceInformationUnstructured } = req.body;

  if (!creditorAccount || !creditorName || !instructedAmount) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'Missing required payment fields' });
  }

  const paymentId = 'payment-id-abc123';
  res.status(201).json({
    paymentId,
    transactionStatus: 'RCVD',
  });
});

// GET /v1/payments/sepa-credit-transfers/:paymentId/status
router.get('/:paymentId/status', requireAuth, (req, res) => {
  const { paymentId } = req.params;
  const payment = payments[paymentId];
  if (!payment) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Payment not found' });
  }
  res.json(payment);
});

module.exports = router;
