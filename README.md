# ShopDemo QA

Automated API and browser tests for ShopDemo, a demo online store. The suite uses Playwright and TypeScript, with browser coverage in Chromium and Firefox.

[View the latest successful test report](https://dariaderiuhina.github.io/shopdemo-aqa/)

## What’s covered

The API tests check product sorting, cart totals, and whether each shopper has a separate cart. Browser tests cover the catalog, cart updates, sign-in, and checkout. The store uses real product and cart endpoints and simulates sign-in and order confirmation.

## Run the tests

From the repository root, using Node.js 22 or later:

```sh
npm run setup
npm run browsers:install
npm run test:smoke
```

For the full suite, run `npm run test:cross-browser`.

[Test strategy](docs/TEST-STRATEGY.md) · [Storefront attribution](THIRD_PARTY_NOTICES.md)
