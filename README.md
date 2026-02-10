# curve-frontend

Curve-frontend is a user-interface application designed to connect to Curve's deployment of smart contracts.
This UI application is designed for both the [Curve](https://curve.finance) dapp, and utilizes [curve-js](https://github.com/curvefi/curve-js) and [curve-llamalend-api](https://github.com/curvefi/curve-llamalend.js) to communicate with the blockchain.

[![CI](https://github.com/curvefi/curve-frontend/actions/workflows/ci.yaml/badge.svg?event=push)](https://github.com/curvefi/curve-frontend/actions/workflows/ci.yaml)
[![Storybook](https://github.com/curvefi/curve-frontend/actions/workflows/storybook.yaml/badge.svg?event=push)](https://curve-dapp-storybook-curvefi.vercel.app/)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [NodeJS](https://nodejs.org/en/about/previous-releases) Active LTS version
- [yarn](https://yarnpkg.com/getting-started/install) version 4.x

## Installation

To install curve-frontend, follow these steps:

```bash
git clone https://github.com/curvefi/curve-frontend.git
cd curve-frontend
yarn
```

## Usage

Start development:

```bash
yarn dev
```

Access the application in a web browser:

- http://localhost:3000

## Folder Structure

This repository is organized as follows:

- `/apps/main`: This application manages router swaps, pool-specific functions (deposit, withdraw, swap), and pool creation [React](https://react.dev/) application.
- `/packages/curve-ui-kit`: Shared UI kit created using Material UI, mapped as `@ui-kit`
- `/packages/prices-api`: Package for consuming the Prices API, mapped as `@curvefi/prices-api`. Soon to be to separated its own NPM package.
- `/tests`: Cypress tests

## Testing

Check the [README](./tests/README.md) in the `tests` directory for instructions on how to run end-to-end tests using Cypress.

To run a specific Cypress spec:

```bash
cd tests
yarn cy run --e2e --spec cypress/e2e/<path>/<test>.cy.ts
yarn cy run --component --spec cypress/component/<path>/<test>.cy.tsx
```

## Troubleshooting

If you have any questions, please contact the dev channel on the [Curve Discord](https://discord.gg/sGDwYnb6W9)

You may also submit an issue on our [GitHub Issue Tracker](https://github.com/curvefi/curve-frontend/issues).

## Contributing

To contribute to Curve Frontend, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

## License

This project is licensed under the [MIT](LICENSE) license.
