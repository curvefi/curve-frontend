# curve-frontend

Curve-frontend is a NextJs user-interface application designed to connect to Curve's deployment of smart contracts.
This UI application is designed for both the [Curve](https://curve.finance) dapp, and utilizes [curve-js](https://github.com/curvefi/curve-js) and [curve-llamalend-api](https://github.com/curvefi/curve-llamalend-js) to communicate with the blockchain.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [nodejs](https://nodejs.org/) version 20
- [yarn](https://yarnpkg.com/) version 1.22

## Installation

To install curve-frontend, follow these steps:

```bash
git clone https://github.com/curvefi/curve-frontend.git
cd curve-frontend
yarn install
```

## Usage

1. Copy `.env.sample` from `/apps/(loan|main|lend)` and update environment variables:

```bash
cp apps/main/.env.sample apps/main/.env.development.local
```

2. Start development:

```bash
yarn dev
```

Access the application in a web browser:

- http://localhost:3000

## Forked Mainnet

To develop against a forked mainnet, connect your wallet to the RPC URL: `http://localhost:8545` or whichever port your forked mainnet is using.

## Folder Structure

This repository is organized as follows:

- `/apps/main`: This application manages router swaps, pool-specific functions (deposit, withdraw, swap), and pool creation [React](https://react.dev/) application.
- `/apps/loan`: crvUSD [React](https://react.dev/) application.
- `/apps/lend`: Lend [React](https://react.dev/) application.
- `/apps/dao`: DAO [React](https://react.dev/) application.
- `/tests`: DApp tests
- `/packages/curve-ui-kit`: Shared UI kit created using Material UI, mapped as `@ui-kit`
- `/packages/prices-api`: Package for consuming the Prices API, mapped as `@curvefi/prices-api`. Soon to be to separated its own NPM package.

## Development Guide

For detailed information on development practices and usage of new libraries, please refer to our [Development Guide](./DEVELOPMENT_GUIDE.md).

## Testing

For testing the DApp application, follow these steps:

1. Navigate to the `tests` directory:

```bash
cd tests
```

2. Follow the instructions in the `README` file located in the `tests` directory.

## Troubleshooting

If you have any questions, please contact the dev channel on the [Curve Discord](https://discord.gg/sGDwYnb6W9)

You may also submit an issue on our [GitHub Issue Tracker](https://github.com/curvefi/curve-frontend/issues).

## Contributing

To contribute to curve-frontend, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively see the GitHub documentation on [creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

## License

This project is licensed under the [MIT](LICENSE) license.
