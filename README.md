# ING Open Banking — Contract Testing Demo

This repository demonstrates two contract testing patterns against ING's PSD2 APIs.

## Patterns

### Classic CDC (Consumer-Driven Contract Testing) — Accounts API
- Consumer: `ing-accounts-mobile-consumer`
- Provider: `ing-accounts-api`
- The consumer writes Pact tests defining expectations; the provider verifies them.

### BDCT (Bi-Directional Contract Testing) — Payments API
- Consumer: `ing-payments-mobile-consumer`
- Provider: `ing-payments-api`
- The provider publishes its OpenAPI spec to PactFlow; PactFlow cross-verifies against consumer pacts.

## PactFlow Workspace
`https://smart-bank.pactflow.io`

## Prerequisites
- Node.js 22+
- Docker (for BDCT publish step)
- GitHub secret: `PACT_BROKER_TOKEN`

## Running locally

```bash
# Accounts consumer tests (generates pact)
cd consumers/accounts-mobile-consumer && npm install && npm test

# Payments consumer tests (generates pact)
cd consumers/payments-mobile-consumer && npm install && npm test

# Accounts provider verification
cd services/accounts-api && npm install && npm run test:pact

# Payments provider BDCT self-verification
cd services/payments-api && npm install && npm run test:bdct
```

## Workflows

| Workflow | Trigger | What it does |
|---|---|---|
| `setup-pactflow.yml` | Manual | Creates environments + registers pacticipants |
| `consumer-accounts.yml` | Push to main/feat | Runs consumer tests, publishes pact, can-i-deploy, records deployment |
| `provider-accounts.yml` | Push to main/feat | Verifies pacts, can-i-deploy, records deployment |
| `consumer-payments.yml` | Push to main/feat | Runs consumer tests, publishes pact, can-i-deploy, records deployment |
| `provider-payments.yml` | Push to main/feat | BDCT self-verify, publish OpenAPI contract, can-i-deploy, records deployment |
