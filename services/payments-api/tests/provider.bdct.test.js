/**
 * BDCT self-verification test for ING Payments API.
 *
 * This test validates that the running service conforms to its own OpenAPI spec
 * (openapi/payments-api.yml). The verification results are written to
 * verification-results.json and then published alongside the OpenAPI spec to
 * PactFlow by the GitHub Actions workflow.
 */
const axios = require('axios');
const app = require('../src/app');
const path = require('path');
const fs = require('fs');

const PORT = 3002;
let server;

const BASE_URL = `http://localhost:${PORT}`;
const PAYMENT_ID = 'payment-id-abc123';
const AUTH = 'Bearer test-access-token';

const results = { tests: [], success: true };

function record(name, passed, detail) {
  results.tests.push({ name, passed, detail: detail || null });
  if (!passed) results.success = false;
}

beforeAll(() => {
  server = app.listen(PORT);
});

afterAll(() => {
  server.close();
  // Write verification results for BDCT publish step
  const outPath = path.resolve(__dirname, '../verification-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
});

describe('Payments API — BDCT Self-Verification', () => {
  describe('POST /v1/payments/sepa-credit-transfers', () => {
    it('returns 201 with paymentId and transactionStatus for a valid request', async () => {
      const res = await axios.post(
        `${BASE_URL}/v1/payments/sepa-credit-transfers`,
        {
          creditorAccount: { iban: 'NL02ABNA0123456789' },
          creditorName: 'Merchant BV',
          instructedAmount: { currency: 'EUR', amount: '150.00' },
          remittanceInformationUnstructured: 'Invoice 2025-001',
        },
        { headers: { Authorization: AUTH, 'Content-Type': 'application/json' } }
      );
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('paymentId');
      expect(res.data).toHaveProperty('transactionStatus');
      record('POST /v1/payments/sepa-credit-transfers 201', true);
    });

    it('returns 401 when Authorization header is absent', async () => {
      try {
        await axios.post(
          `${BASE_URL}/v1/payments/sepa-credit-transfers`,
          {
            creditorAccount: { iban: 'NL02ABNA0123456789' },
            creditorName: 'Merchant BV',
            instructedAmount: { currency: 'EUR', amount: '150.00' },
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        record('POST /v1/payments/sepa-credit-transfers 401', false, 'Expected 401 but got 2xx');
        throw new Error('Expected 401');
      } catch (err) {
        if (err.response && err.response.status === 401) {
          expect(err.response.data).toHaveProperty('code');
          expect(err.response.data).toHaveProperty('message');
          record('POST /v1/payments/sepa-credit-transfers 401', true);
        } else {
          record('POST /v1/payments/sepa-credit-transfers 401', false, String(err));
          throw err;
        }
      }
    });
  });

  describe('GET /v1/payments/sepa-credit-transfers/:paymentId/status', () => {
    it('returns 200 with paymentId and transactionStatus for a known payment', async () => {
      const res = await axios.get(
        `${BASE_URL}/v1/payments/sepa-credit-transfers/${PAYMENT_ID}/status`,
        { headers: { Authorization: AUTH } }
      );
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('paymentId');
      expect(res.data).toHaveProperty('transactionStatus');
      record('GET /v1/payments/sepa-credit-transfers/:paymentId/status 200', true);
    });

    it('returns 401 when Authorization header is absent', async () => {
      try {
        await axios.get(
          `${BASE_URL}/v1/payments/sepa-credit-transfers/${PAYMENT_ID}/status`
        );
        record('GET /v1/payments/sepa-credit-transfers/:paymentId/status 401', false, 'Expected 401 but got 2xx');
        throw new Error('Expected 401');
      } catch (err) {
        if (err.response && err.response.status === 401) {
          expect(err.response.data).toHaveProperty('code');
          record('GET /v1/payments/sepa-credit-transfers/:paymentId/status 401', true);
        } else {
          record('GET /v1/payments/sepa-credit-transfers/:paymentId/status 401', false, String(err));
          throw err;
        }
      }
    });

    it('returns 404 for an unknown payment', async () => {
      try {
        await axios.get(
          `${BASE_URL}/v1/payments/sepa-credit-transfers/unknown-id/status`,
          { headers: { Authorization: AUTH } }
        );
        record('GET /v1/payments/sepa-credit-transfers/:paymentId/status 404', false, 'Expected 404 but got 2xx');
        throw new Error('Expected 404');
      } catch (err) {
        if (err.response && err.response.status === 404) {
          record('GET /v1/payments/sepa-credit-transfers/:paymentId/status 404', true);
        } else {
          record('GET /v1/payments/sepa-credit-transfers/:paymentId/status 404', false, String(err));
          throw err;
        }
      }
    });
  });
});
