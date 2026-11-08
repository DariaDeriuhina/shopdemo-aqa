# ShopDemo — controlled test application

Derived from [ettaverse/dummy-ecommerce](https://github.com/ettaverse/dummy-ecommerce).
See [provenance](../THIRD_PARTY_NOTICES.md). This is a local learning/test application,
not a production storefront.

```sh
npm ci
npm run dev
# Or the production mode used by CI:
npm run build
npm start
```

Requires Node.js 22+. The interactive dev server uses Webpack; automated release
tests use a fresh production build to avoid hot-reload interference. Local images and system fonts avoid remote asset dependencies.

## Server HTTP routes

| Method | Route             | Contract                                 |
| ------ | ----------------- | ---------------------------------------- |
| GET    | /api/products     | products; optional search/category/sort  |
| GET    | /api/products/:id | product; 404 for an unknown ID           |
| GET    | /api/cart         | items and total in cents                 |
| POST   | /api/cart         | productId, optional quantity (default 1) |
| PATCH  | /api/cart/:id     | quantity, 0 removes a position           |
| DELETE | /api/cart/:id     | removes a position                       |

Cart responses contain `{ items, total }`. Quantities are integers 1–99 (PATCH also
accepts 0). Duplicate products merge up to 99. Invalid input/JSON returns 400,
unknown products/items 404, and out-of-stock products 409. Failed requests preserve
cart state. Prices come from server product data, not from the submitted request.

Cart sessions use an HttpOnly SameSite=Lax cookie and `Cache-Control: no-store`.
Storage belongs to one Node process, expires after 24h, and resets on restart.
Initialize a session with GET before issuing concurrent requests from a new client.
This store is not suitable for multi-process deployment or production user accounts.

## Browser mock routes

MSW handles auth/signup/logout/me and checkout. The checkout handler reads the
real cart and clears its items after validating synthetic shipping/payment data.
It does not charge cards, call a bank or persist an order. Auth tokens are demo
values, not a security implementation. Seeded demo user: demo@shopdemo.com / Demo@123.
New runtime users may disappear on a full reload of the MSW handlers.

`?e2eNoMsw=1` explicitly bypasses MSW initialization for network and API/UI tests.
Auth/checkout simulations are unavailable on a page started in that mode.
Normal MSW startup is shared across React Strict Mode effect runs; failure renders
an error instead of leaving the page loading indefinitely.

Catalog requests cancel superseded queries and distinguish HTTP/network errors
from a successful empty catalog. Cart mutation failures display an error while
preserving the previous valid UI state.

Available routes: /, /products/:id, /cart, /checkout, /order-confirmation, /login, /signup.
Stable `data-testid` attributes are in the source components and used by the framework.
