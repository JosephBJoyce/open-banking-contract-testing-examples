const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { like, regex } = MatchersV3;
const PaymentsApiClient = require('../src/paymentsApiClient');
const path = require('path');

const provider = new PactV3({
  consumer: 'ing-payments-mobile-consumer',
  provider: 'ing-payments-api',
  dir: path.resolve(__dirname, '../pacts'),
  logLevel: 'warn',
});

const PAYMENT_ID = 'payment-id-abc123';
const REQUEST_ID = 'b1c2d3e4-0000-0000-0000-000000000002';

const PAYMENT_INITIATION = {
  creditorAccount: { iban: 'NL02ABNA0123456789' },
  creditorName: 'Merchant BV',
  instructedAmount: { currency: 'EUR', amount: '150.00' },
  remittanceInformationUnstructured: 'Invoice 2025-001',
};

describe('Payments API — Consumer Pact Tests', () => {
  // ── POST /v1/payments/sepa-credit-transfers ───────────────────────────────

  describe('POST /v1/payments/sepa-credit-transfers', () => {
    it('initiates a SEPA credit transfer when authenticated', () => {
      provider
        .given('the customer is authorised to make payments')
        .uponReceiving('a request to initiate a SEPA credit transfer')
        .withRequest({
          method: 'POST',
          path: '/v1/payments/sepa-credit-transfers',
          headers: {
            Authorization: like('Bearer test-access-token'),
          },
          body: {
            creditorAccount: { iban: like('NL02ABNA0123456789') },
            creditorName: like('Merchant BV'),
            instructedAmount: {
              currency: like('EUR'),
              amount: like('150.00'),
            },
            remittanceInformationUnstructured: like('Invoice 2025-001'),
          },
        })
        .willRespondWith({
          status: 201,
          body: {
            paymentId: like('payment-id-abc123'),
            transactionStatus: like('RCVD'),
          },
        });

      return provider.executeTest(async (mockServer) => {
        const client = new PaymentsApiClient(mockServer.url, 'test-access-token');
        const data = await client.initiatePayment(PAYMENT_INITIATION, REQUEST_ID);
        expect(data).toHaveProperty('paymentId');
        expect(data).toHaveProperty('transactionStatus');
      });
    });

    it('returns 401 when no authorization header is provided', () => {
      provider
        .given('no authentication provided')
        .uponReceiving('an unauthenticated request to initiate a payment')
        .withRequest({
          method: 'POST',
          path: '/v1/payments/sepa-credit-transfers',
          body: like(PAYMENT_INITIATION),
        })
        .willRespondWith({
          status: 401,
          body: {
            code: like('UNAUTHORIZED'),
            message: like('Missing or invalid authorization header'),
          },
        });

      return provider.executeTest(async (mockServer) => {
        const axios = require('axios');
        await expect(
          axios.post(
            `${mockServer.url}/v1/payments/sepa-credit-transfers`,
            PAYMENT_INITIATION
          )
        ).rejects.toMatchObject({ response: { status: 401 } });
      });
    });
  });

  // ── GET /v1/payments/sepa-credit-transfers/:paymentId/status ─────────────

  describe('GET /v1/payments/sepa-credit-transfers/:paymentId/status', () => {
    it('returns payment status for a known payment when authenticated', () => {
      provider
        .given(`payment ${PAYMENT_ID} exists`)
        .uponReceiving('a request to get payment status')
        .withRequest({
          method: 'GET',
          path: `/v1/payments/sepa-credit-transfers/${PAYMENT_ID}/status`,
          headers: {
            Authorization: like('Bearer test-access-token'),
          },
        })
        .willRespondWith({
          status: 200,
          body: {
            paymentId: like(PAYMENT_ID),
            transactionStatus: like('ACSC'),
          },
        });

      return provider.executeTest(async (mockServer) => {
        const client = new PaymentsApiClient(mockServer.url, 'test-access-token');
        const data = await client.getPaymentStatus(PAYMENT_ID, REQUEST_ID);
        expect(data).toHaveProperty('paymentId');
        expect(data).toHaveProperty('transactionStatus');
      });
    });

    it('returns 401 when no authorization header is provided', () => {
      provider
        .given('no authentication provided')
        .uponReceiving('an unauthenticated request to get payment status')
        .withRequest({
          method: 'GET',
          path: `/v1/payments/sepa-credit-transfers/${PAYMENT_ID}/status`,
        })
        .willRespondWith({
          status: 401,
          body: {
            code: like('UNAUTHORIZED'),
            message: like('Missing or invalid authorization header'),
          },
        });

      return provider.executeTest(async (mockServer) => {
        const axios = require('axios');
        await expect(
          axios.get(
            `${mockServer.url}/v1/payments/sepa-credit-transfers/${PAYMENT_ID}/status`
          )
        ).rejects.toMatchObject({ response: { status: 401 } });
      });
    });
  });
});
