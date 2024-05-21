## Curve DApp Tests

This repository contains tests for the Curve DApp. The setup includes running Hardhat nodes and executing Cypress tests.

### Installation

1. Install the dependencies:

   ```sh
   yarn install
   ```

2. Create and configure your `.env` files. You can start by copying the `.env.sample` file:

   ```sh
   cp .env.sample .env.development.local
   ```

### Running Hardhat Nodes

To start the Hardhat nodes:

```sh
yarn run:nodes
```

You can also start specific chain nodes by passing the chain IDs as parameters, separated by commas:

```sh
yarn run:nodes 1,137
```

Nodes for each network start on port `8545 + chainId`. For example, the Ethereum node (chainId 1) will be started on port `8546`.

### Cypress Tests

Cypress tests require the necessary nodes to be started before running. Make sure the nodes are running before executing the tests.

To open Cypress for the main configuration:

```sh
yarn cy:open:e2e:main
```

To run Cypress tests in headless mode for the main configuration:

```sh
yarn cy:run:e2e:main
```

Other configurations (lend, loan) can be run similarly by replacing `main` with `lend` or `loan`.

### Writing New Tests

Tests for each DApp are created in the corresponding directory:

- `tests/cypress/e2e/main`
- `tests/cypress/e2e/loan`
- `tests/cypress/e2e/lend`

Helper functions can be found in the `tests/cypress/support/helpers` directory.

Below is a brief example of how to use important helper functions:

```typescript
describe('Test Suite', () => {
  beforeEach(() => {
    cy.createJsonRpcProvider() // Initializes and returns a JSON RPC provider
      .as('jsonRpcProvider', { type: 'static' })
      .createRandomWallet('1', [{ symbol: 'CRV', amount: '1000' }]) // Creates a random wallet with 1 Ether and 1000 CRV tokens
      .as('wallet', { type: 'static' })
      .prepareMetamaskWallet() // Prepares and configures the Metamask wallet for testing

    cy.visit('...') // Visits the specified URL

    cy.get('@wallet').connectMetamask() // Connects the prepared Metamask wallet to the application
  })

  it('should create a random wallet and perform actions', () => {
    // Test actions using the prepared wallet
    cy.get('@wallet').then((wallet) => {
      // Interact with the wallet in your tests
    })
  })
})
```

#### Helper Functions

- **createJsonRpcProvider**: Initializes and returns a JSON RPC provider.
- **createRandomWallet**: Creates a random wallet with a specified amount of Ether and tokens.
- **prepareMetamaskWallet**: Prepares and configures the Metamask wallet for testing.
- **connectMetamask**: Connects the prepared Metamask wallet to the application.
- **tokenBalance**: Retrieves the balance of a specified token for a given wallet.
