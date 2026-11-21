# ShopDemo tests

[Open the latest successful regression report](https://dariaderiuhina.github.io/shopdemo-aqa/) · [GitHub Actions run history](https://github.com/DariaDeriuhina/shopdemo-aqa/actions/workflows/tests.yml)

I use Playwright and TypeScript to test a small online shop. The report lists the API tests and the browser tests run in Chromium and Firefox. Open a test to see its steps and timing.

One bug I wanted to catch was a lost click in the cart. A shopper starts with two items and clicks **+** twice while the first update is still loading. If both updates succeed, the cart should show four. The test holds the first response open, makes the second click, then checks the quantity on screen and on the server. [Read the cart test](shopdemo-framework/tests/integration/cart-concurrency.spec.ts)

## What the tests cover

Products and carts use real HTTP routes in the local demo shop. The API tests check rules like cart totals and keeping two shoppers’ carts separate. Browser tests cover shopping, sign-in and demo checkout. The demo simulates sign-in and order confirmation in the browser. Checkout clears the shopper’s cart.

## Run it locally

Use Node.js 22 or newer. From the repository root, run:

```sh
npm run setup
npm run browsers:install
npm run test:smoke
npm run test:report
```

Playwright starts the shop for you. For the full API, Chromium and Firefox run, use `npm run test:cross-browser`.

The tests live in [shopdemo-framework/tests](shopdemo-framework/tests). The [test strategy](docs/TEST-STRATEGY.md) explains the coverage. The [architecture notes](docs/ARCHITECTURE.md) explain the setup. The demo shop is adapted from [ShopDemo](THIRD_PARTY_NOTICES.md).
