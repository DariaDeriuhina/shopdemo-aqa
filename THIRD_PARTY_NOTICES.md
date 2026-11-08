# Third-party provenance

The application in `dummy-ecommerce/` is derived from
[ettaverse/dummy-ecommerce](https://github.com/ettaverse/dummy-ecommerce),
local upstream commit `ef56b87943937a394b706f3f8ed40a549698069d`.
It supplies the storefront, authentication/checkout MSW behavior, components,
and seeded demo data. This portfolio is not presented as authorship of that application.

Local extensions include real Products and Cart HTTP routes, session isolation,
validation, resilient UI states, deterministic local assets and MSW test-mode startup.
The separate `shopdemo-framework/` contains the automation implementation.
Dependency licenses remain with their respective packages; lockfiles record their versions.
No new license is assigned here to third-party application code.
