const { Verifier } = require('@pact-foundation/pact');
const app = require('../src/app');
const path = require('path');

const PORT = 3001;
let server;

beforeAll(() => {
  server = app.listen(PORT);
});

afterAll(() => {
  server.close();
});

describe('Accounts API — Provider Pact Verification', () => {
  it('verifies pacts from PactFlow', () => {
    const opts = {
      provider: 'ing-accounts-api',
      providerBaseUrl: `http://localhost:${PORT}`,

      // Fetch pacts from PactFlow
      pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,

      publishVerificationResults: true,
      providerVersion: process.env.GITHUB_SHA || process.env.GIT_COMMIT,
      providerVersionBranch: process.env.GITHUB_REF_NAME || process.env.GIT_BRANCH || 'main',

      consumerVersionSelectors: [
        { mainBranch: true },
        { matchingBranch: true },
        { deployedOrReleased: true },
      ],

      enablePending: true,

      // Provider states
      stateHandlers: {
        'the customer has accounts': async () => {
          // Data is static; nothing to set up
        },
        [`account 3dc3d5b3-7023-4848-9853-f5400a64e80f exists`]: async () => {
          // Data is static; nothing to set up
        },
        [`account 3dc3d5b3-7023-4848-9853-f5400a64e80f has transactions`]: async () => {
          // Data is static; nothing to set up
        },
        'no authentication provided': async () => {
          // No setup needed — the middleware handles it
        },
      },

      logLevel: 'warn',
    };

    return new Verifier(opts).verifyProvider();
  });
});
