## Curve DApp Tests

This repository contains tests for the Curve DApp. The setup includes running Hardhat nodes and executing Cypress tests.

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

### Folder Structure

Tests for each DApp are created in the corresponding directory:

- `tests/cypress/{e2e|component}/{app}`

Helper functions can be found in the `tests/cypress/support/helpers` directory.
