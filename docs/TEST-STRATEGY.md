# Test strategy and coverage

## Risk model

The highest-value risks are incorrect product data, shared cart state, lost cart
updates, incorrect totals and a broken product-to-checkout journey. These receive
real HTTP tests and API/UI integration coverage. Network overrides cover deliberate
failures independently of application availability. Login/signup/logout are tested
against the application's documented MSW simulation, not a production auth service.

## Release suite

The default suite has **47 scenarios**: **23 API** and **24 Chromium**.
With Chromium and Firefox, API runs once and 24 UI scenarios run in each browser:
**71 executions**. Six smoke scenarios cover catalog API, cart lifecycle, seeded
login, catalog after login, API/UI cart consistency and complete demo checkout.
All normal tests carry `@regression`; smoke is a subset, not a second test copy.

| Risk or behavior                                                | Evidence in source                                        |
| --------------------------------------------------------------- | --------------------------------------------------------- |
| Product list/search/category/sort/detail/unknown ID             | tests/api/products.spec.ts                                |
| CRUD lifecycle, merge, totals, zero removal                     | tests/api/cart.spec.ts                                    |
| Invalid JSON and quantities do not change state                 | tests/api/cart.spec.ts; tests/api/cart-validation.spec.ts |
| Stock enforcement, default quantity, quantity cap               | tests/api/cart-validation.spec.ts                         |
| Concurrent additions are not lost                               | tests/api/cart-validation.spec.ts                         |
| Separate sessions cannot read/change each other's cart          | tests/api/cart.spec.ts                                    |
| Multi-product totals and partial deletion                       | tests/api/cart-validation.spec.ts                         |
| Cookie flags and cache policy                                   | tests/api/cart-validation.spec.ts                         |
| Login, invalid credentials, signup, reload, logout              | tests/auth.spec.ts                                        |
| Catalog empty search, category and sorting consistent with API  | tests/catalog.spec.ts                                     |
| Product UI → real cart → reload retains state                   | tests/shopping.spec.ts                                    |
| Out-of-stock UI control is disabled                             | tests/shopping.spec.ts                                    |
| UI checkout validates input and clears real cart                | tests/shopping.spec.ts                                    |
| Failed cart mutation shows error and keeps valid state          | tests/shopping.spec.ts                                    |
| API seed appears in UI; UI changes are observable via API       | tests/integration/cart-integration.spec.ts                |
| API catalog matches visible cards                               | tests/integration/products-integration.spec.ts            |
| Delayed request shows loading; HTTP/network failure shows error | tests/network/products-errors.spec.ts                     |
| Overridden response/empty catalog                               | tests/network/products-network.spec.ts                    |

A passing contract assertion is not a substitute for a business assertion. Tests
check status first, parse the schema, then check quantities, totals, membership or
visible behavior. Negative tests verify the previous state is preserved.

## Execution levels

- Smoke: quick local check before reviewing changes.
- Default regression: API plus Chromium for functional changes.
- Cross-browser: Firefox and Chromium for the release matrix.
- Stability: cart API and integration cases repeated five times with five workers.
- CI: production build, one worker, retries visible and flakes fail the run.

Tests do not rely on order, fixed sleeps, shared mutable fixtures or live third-party
websites. Images and fonts are local. Network tests deliberately control responses;
they do not claim to verify a real service outage.

## Scope limits

This release is functional automation, not a performance/load test, security audit,
accessibility certification, payment integration, database test or production-ready
backend. The in-memory cart belongs to one process. Multi-process storage, durable
orders and production identity are explicit future extensions, not hidden TODOs
inside tests. WebKit/mobile coverage is not claimed.
