# ShopDemo AQA Portfolio

TypeScript + Playwright automation for a controlled local e-commerce application.
The project demonstrates risk-based coverage, Page Objects, API clients, runtime
contracts, isolated test data, cross-browser execution and failure diagnostics.

## Quick start

Prerequisites: Node.js 22+ and npm. All commands below run from this folder.

```sh
npm run setup
npm run browsers:install
npm run check
npm run test:smoke
```

Tests build and manage a fresh production version of the sibling application automatically. No API key, account registration,
external test website or payment service is needed. Test checkout only simulates an order.
`setup` and browser installation download development dependencies once.

## Commands

| Command                      | Purpose                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| `npm test`                   | Full API + Chromium regression                               |
| `npm run test:smoke`         | Six critical business scenarios                              |
| `npm run test:api`           | HTTP-only tests; no browser launch                           |
| `npm run test:browser`       | Chromium UI/integration/network tests                        |
| `npm run test:cross-browser` | API once + Chromium and Firefox                              |
| `npm run test:stability`     | Cart API/UI cases repeated five times on five workers        |
| `npm run test:ci`            | Fresh production build, one worker, flaky tests fail the run |
| `npm run test:report`        | Open the last HTML report                                    |
| `npm run dev`                | Start the application manually                               |

Stop a manually started server before managed test runs: it requires its own fresh server.
Use `START_WEB_SERVER=0` explicitly to test an already running compatible server.

## Repository layout

```text
.github/workflows/tests.yml       # manually triggered CI pipeline
package.json                     # convenience commands for both folders
shopdemo-framework/
  src/config/                    # validated environment settings
  src/pages/                     # UI business actions; assertions live in tests
  src/api/                       # reusable HTTP clients returning raw responses
  src/schemas/                   # runtime contracts with Zod
  src/data/                      # independent test-data factories
  src/fixtures/                  # lifecycle, session sharing and cleanup
  src/support/                   # failure diagnostics
  tests/api/                     # real HTTP contracts, CRUD, validation, isolation
  tests/integration/             # real API state ↔ browser state
  tests/network/                 # controlled delays, failures and response overrides
  tests/shopping.spec.ts          # product → cart → demo checkout
dummy-ecommerce/                 # local Next.js application derived from ShopDemo
docs/                            # architecture and test strategy
```

## What is real and what is simulated?

| Capability                                            | Implementation                                                               |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| Products list/detail                                  | Real Next.js GET HTTP routes                                                 |
| Cart GET/POST/PATCH/DELETE                            | Real Next.js HTTP routes; HttpOnly session cookie                            |
| Cart storage                                          | In memory in one Node process; expires after 24h; resets on restart          |
| Auth, signup, logout                                  | Browser MSW simulation with seeded demo accounts                             |
| Checkout                                              | Browser MSW validates data, reads/clears the real cart, returns a demo order |
| Persistence, real payments, production authentication | Outside this portfolio's scope                                               |

An API test exercises server code. A checkout UI test exercises the demo integration;
it does not prove a production payment or order service. This distinction is explicit
in the [test strategy](docs/TEST-STRATEGY.md) and [architecture](docs/ARCHITECTURE.md).

## Configuration

Variables are read from the shell/CI, not automatically from `.env` files.
See `shopdemo-framework/.env.example` for all supported values.

```sh
# Use another local port (Playwright starts the server on that port):
BASE_URL=http://127.0.0.1:3100 npm test
# Reuse an already deployed compatible demo:
BASE_URL=https://your-test-host.example START_WEB_SERVER=0 npm test
# Run both supported browsers against a production build:
BROWSERS=chromium,firefox npm run test:ci
```

Invalid settings fail at startup. Defaults: loopback port 3000, Chromium,
4 local workers/1 CI worker, no local retries/1 CI retry.
CI uses `failOnFlakyTests`: a test passing only on retry still fails the pipeline.
WebKit is an optional configuration, not part of the verified release matrix.

## Reports and CI

All normal runs produce HTML plus JUnit. Browser failures also keep a trace,
screenshot and bounded `browser-diagnostics` JSON attachment. Request URL query
strings, headers and bodies are not copied into that JSON. Console messages and
Playwright traces can still contain application data; use synthetic test data.

A manual GitHub Actions workflow runs quality gates, then separate API/Chromium/Firefox
jobs and preserves artifacts on failure. It expects this entire folder as one repository.
No workflow has been published or remotely executed as part of local preparation.

Technical documentation: [architecture](docs/ARCHITECTURE.md) and
[test strategy](docs/TEST-STRATEGY.md).

Application attribution: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
