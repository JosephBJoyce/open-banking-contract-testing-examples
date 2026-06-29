const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { like, regex, eachLike } = MatchersV3;
const AccountsApiClient = require('../src/accountsApiClient');
const path = require('path');

// ISO date helper — never use datetime() on date-only fields
const isoDate = (example) => regex('^\\d{4}-\\d{2}-\\d{2}$', example);

const provider = new PactV3({
  consumer: 'ing-accounts-mobile-consumer',
  provider: 'ing-accounts-api',
  dir: path.resolve(__dirname, '../pacts'),
  logLevel: 'warn',
});

const ACCOUNT_ID = '3dc3d5b3-7023-4848-9853-f5400a64e80f';
const REQUEST_ID = 'a1b2c3d4-0000-0000-0000-000000000001';

describe('Accounts API — Consumer Pact Tests', () => {
  // ── GET /v3/accounts ──────────────────────────────────────────────────────

  describe('GET /v3/accounts', () => {
    it('returns a list of accounts when authenticated', () => {
      provider
        .given('the customer has accounts')
        .uponReceiving('a request to list accounts')
        .withRequest({
          method: 'GET',
          path: '/v3/accounts',
          headers: {
            Authorization: like('Bearer test-access-token'),
          },
        })
        .willRespondWith({
          status: 200,
          body: {
            accounts: eachLike({
              resourceId: like('3dc3d5b3-7023-4848-9853-f5400a64e80f'),
              iban: regex('^NL\\d{2}[A-Z]{4}\\d{10}$', 'NL91INGB0417164300'),
              currency: like('EUR'),
              accountType: like('Current'),
              name: like('Jan de Vries'),
              status: like('enabled'),
            }),
          },
        });

      return provider.executeTest(async (mockServer) => {
        const client = new AccountsApiClient(mockServer.url, 'test-access-token');
        const data = await client.getAccounts(REQUEST_ID);
        expect(data.accounts).toHaveLength(1);
        expect(data.accounts[0]).toHaveProperty('iban');
        expect(data.accounts[0]).toHaveProperty('resourceId');
      });
    });

    it('returns 401 when no authorization header is provided', () => {
      provider
        .given('no authentication provided')
        .uponReceiving('an unauthenticated request to list accounts')
        .withRequest({
          method: 'GET',
          path: '/v3/accounts',
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
          axios.get(`${mockServer.url}/v3/accounts`)
        ).rejects.toMatchObject({ response: { status: 401 } });
      });
    });
  });

  // ── GET /v3/accounts/:accountId/balances ─────────────────────────────────

  describe('GET /v3/accounts/:accountId/balances', () => {
    it('returns balances for a known account when authenticated', () => {
      provider
        .given(`account ${ACCOUNT_ID} exists`)
        .uponReceiving('a request to get account balances')
        .withRequest({
          method: 'GET',
          path: `/v3/accounts/${ACCOUNT_ID}/balances`,
          headers: {
            Authorization: like('Bearer test-access-token'),
          },
        })
        .willRespondWith({
          status: 200,
          body: {
            balances: eachLike({
              balanceType: like('closingBooked'),
              balanceAmount: {
                currency: like('EUR'),
                amount: like('2450.00'),
              },
              referenceDate: isoDate('2025-09-01'),
            }),
          },
        });

      return provider.executeTest(async (mockServer) => {
        const client = new AccountsApiClient(mockServer.url, 'test-access-token');
        const data = await client.getBalances(ACCOUNT_ID, REQUEST_ID);
        expect(data.balances).toHaveLength(1);
        expect(data.balances[0]).toHaveProperty('balanceAmount');
        expect(data.balances[0].balanceAmount).toHaveProperty('amount');
      });
    });

    it('returns 401 when no authorization header is provided', () => {
      provider
        .given('no authentication provided')
        .uponReceiving('an unauthenticated request to get balances')
        .withRequest({
          method: 'GET',
          path: `/v3/accounts/${ACCOUNT_ID}/balances`,
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
          axios.get(`${mockServer.url}/v3/accounts/${ACCOUNT_ID}/balances`)
        ).rejects.toMatchObject({ response: { status: 401 } });
      });
    });
  });

  // ── GET /v3/accounts/:accountId/transactions ──────────────────────────────

  describe('GET /v3/accounts/:accountId/transactions', () => {
    it('returns transactions for a known account when authenticated', () => {
      provider
        .given(`account ${ACCOUNT_ID} has transactions`)
        .uponReceiving('a request to get account transactions')
        .withRequest({
          method: 'GET',
          path: `/v3/accounts/${ACCOUNT_ID}/transactions`,
          headers: {
            Authorization: like('Bearer test-access-token'),
          },
        })
        .willRespondWith({
          status: 200,
          body: {
            transactions: {
              booked: eachLike({
                transactionId: like('TX-20250901-00001'),
                bookingDate: isoDate('2025-09-01'),
                valueDate: isoDate('2025-09-01'),
                transactionAmount: {
                  currency: like('EUR'),
                  amount: like('-85.50'),
                },
                creditorName: like('Albert Heijn BV'),
                remittanceInformationUnstructured: like('Boodschappen 01-09-2025'),
              }),
            },
          },
        });

      return provider.executeTest(async (mockServer) => {
        const client = new AccountsApiClient(mockServer.url, 'test-access-token');
        const data = await client.getTransactions(ACCOUNT_ID, REQUEST_ID);
        expect(data.transactions.booked).toHaveLength(1);
        expect(data.transactions.booked[0]).toHaveProperty('transactionId');
        expect(data.transactions.booked[0].transactionAmount).toHaveProperty('amount');
      });
    });

    it('returns 401 when no authorization header is provided', () => {
      provider
        .given('no authentication provided')
        .uponReceiving('an unauthenticated request to get transactions')
        .withRequest({
          method: 'GET',
          path: `/v3/accounts/${ACCOUNT_ID}/transactions`,
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
          axios.get(`${mockServer.url}/v3/accounts/${ACCOUNT_ID}/transactions`)
        ).rejects.toMatchObject({ response: { status: 401 } });
      });
    });
  });
});
