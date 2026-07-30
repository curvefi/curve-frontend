## Curve DApp Tests

This repository contains tests for the Curve DApp.

### Installation

1. Install the dependencies:

```sh
yarn
```

### Cypress Tests

Cypress tests require the necessary application to be started before running.

```sh
yarn dev
```

To open Cypress:

```sh
yarn cy:open:e2e  # Opens Cypress for end-to-end tests
yarn cy:open:component  # Opens Cypress for component tests
```

To run Cypress tests in headless mode:

```sh
yarn cy:run:e2e
yarn cy:run:component
```

To run a specific Cypress spec (via the `cy` script):

```sh
yarn cy run --e2e --spec cypress/e2e/<path>/<test>.cy.ts
yarn cy run --component --spec cypress/component/<path>/<test>.cy.tsx
```

Each Cypress run prints the seed used to generate random test data. Runs without `TEST_SEED` use a new seed, while reusing a seed replays the same random sequence for each spec:

```sh
TEST_SEED=18273645-1 yarn cy:run:e2e --browser firefox --spec cypress/e2e/llamalend/llamalend-markets.cy.ts
TEST_SEED=18273645-1 yarn cy:run:component --browser firefox --spec cypress/component/<path>/<test>.cy.tsx
```

GitHub Actions uses the run ID and test iteration as its seed. The same iteration uses the same seed across browsers, and rerunning a GitHub workflow run reuses its seeds.

### Folder Structure

Tests for each DApp are created in the corresponding directory:

- `tests/cypress/{e2e|component}/{app}`

Helper functions can be found in the `tests/cypress/support/helpers` directory.
