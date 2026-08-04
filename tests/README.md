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

CI uses the run ID, run attempt, and test iteration as its seed. The same iteration uses the same seed across browsers within an attempt, while rerunning failed CI jobs gets a new replayable seed. The flake-detection workflow intentionally reuses its seeds when rerun.

### Flake Detection

Run repeated component or end-to-end tests with the manual `Cypress Flake Detection` workflow:

```sh
gh workflow run cypress-flake-detection.yaml --ref <branch> \
  -f suite=e2e-llamalend \
  -f browser=all \
  -f repetitions=10
```

Use the optional `specs`, `seed_prefix`, and `start_iteration` inputs to target a spec or replay known seeds. RPC specs are intentionally excluded. Videos are recorded in Chrome and Electron; Firefox does not support recording.

Download uploaded artifacts and the failed step log from every failed job:

```sh
RUN_ID=<run-id> WORKFLOW=cypress-flake-detection \
  yarn workspace tests download:artifacts --skip-cleanup
```

Failure evidence is stored under `artifacts/<branch>/<run-id>`, including a `failed-job-logs` directory. The workflow must exist on the default branch before GitHub allows manual dispatches.

### Folder Structure

Tests for each DApp are created in the corresponding directory:

- `tests/cypress/{e2e|component}/{app}`

Helper functions can be found in the `tests/cypress/support/helpers` directory.
