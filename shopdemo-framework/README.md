# ShopDemo Playwright framework

See the [portfolio README](../README.md) for setup, architecture and scope.
This folder can also be used directly; the application is expected at `../dummy-ecommerce`.

```sh
npm ci
npx playwright install chromium firefox
npm run check
npm run test:smoke
npm run test:regression
npm run test:ci
```

Projects select non-overlapping files: `api` selects `tests/api/**/*.spec.ts`;
configured browser projects select the rest. All test suites carry `@regression`;
six critical scenarios additionally carry `@smoke`. Regression includes smoke once.

`apiTestFixtures` uses an isolated standalone request context. `cartTestFixtures`
uses `context.request`, sharing cookies with UI. Both reuse a CartApiClient and
finally cleanup. The `page` fixture adds browser diagnostics lazily, so API-only
tests do not start a browser. Test steps describe business phases where they help.

Commands support Playwright flags, e.g. `npm run test:api -- --grep @smoke`.
Environment settings are validated in `src/config/environment.ts`.

On unexpected browser test failures the report includes a screenshot, trace and
`browser-diagnostics` JSON attachment. Reports are available through `npm run test:report`.
