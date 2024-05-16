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

### Cypress Tests

Cypress tests automatically start the necessary nodes before running and stop them after completion.

To open Cypress for the main configuration:

```sh
yarn cy:open:e2e:main
```

To run Cypress tests in headless mode for the main configuration:

```sh
yarn cy:run:e2e:main
```

Other configurations (lend, loan) can be run similarly by replacing `main` with `lend` or `loan`.

### Running Hardhat Nodes

To start the Hardhat nodes:

```sh
yarn run:nodes
```

You can also start specific chain nodes by passing the chain IDs as parameters, separated by commas:

```sh
yarn run:nodes 1,137
```

To stop the running nodes:

```sh
yarn kill:nodes
```

You can also stop specific chain nodes by passing the chain IDs as parameters, separated by commas:

```sh
yarn kill:nodes 1,137
```
