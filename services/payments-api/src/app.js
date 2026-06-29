const express = require('express');
const paymentsRouter = require('./routes/payments');

const app = express();
app.use(express.json());

app.use('/v1/payments/sepa-credit-transfers', paymentsRouter);

module.exports = app;
