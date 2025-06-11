# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development
yarn dev                # Start all apps in development mode on localhost:3000
yarn build              # Build all apps for production
yarn start              # Start production builds
yarn lint               # Lint all code
yarn lint:fix           # Fix linting issues automatically
yarn typecheck          # Run TypeScript checks across all packages
yarn format             # Format code with Prettier
yarn format:check       # Check code formatting without fixing

# Testing
cd tests
yarn cy:open:e2e        # Open Cypress E2E tests interactively
yarn cy:run:e2e         # Run Cypress E2E tests headless

# Bundle Analysis
cd apps/main
yarn analyze            # Analyze bundle size (sets ANALYZE=true)

# UI Kit Development
yarn storybook          # Run Storybook for UI components
yarn storybook:build    # Build Storybook static files
```

## Architecture Overview

### Monorepo Structure

This is a **Turborepo monorepo** with a single Next.js 15.2.4 application that handles multiple DeFi domains:

- **`/apps/main`**: Main Next.js app with App Router containing all domains
- **`/packages/curve-ui-kit`**: Shared UI components with Storybook
- **`/packages/ui`**: Additional UI components
- **`/packages/prices-api`**: Curve prices API client
- **`/packages/external-rewards`**: Campaign rewards configuration
- **`/tests`**: Cypress E2E tests with Hardhat node support

### Domain Organization

The main app is organized by financial product domains under `/apps/main/src/app/`:

- **`/dex`**: Router swaps, pool management (deposit/withdraw/swap), pool creation
- **`/crvusd`**: crvUSD minting, collateral management, liquidation
- **`/lend`**: LlamaLend markets, lending/borrowing functionality
- **`/dao`**: Governance, voting, gauge management, veCRV features

Each domain follows a consistent structure:

```
src/[domain]/
  components/          # Domain-specific React components
  store/              # Zustand state slices
  utils/              # Domain utilities
  hooks/              # Custom hooks
  entities/           # Data models and validation
  types/              # TypeScript types
```

### Key Technologies

**Core Stack:**

- Next.js 15.2.4 with App Router
- React 19.1.0
- TypeScript 5.8.3
- Node.js 22 (required)
- Yarn 4.6.0

**State & Data:**

- Zustand 4.5.7 for client state (we want to deprecate this in favor of tanstack react-query)
- Immer 9.0.21 for immutable updates
- @tanstack/react-query 5.76.1 (we want to deprecate Zustand in favor of this)

**Blockchain:**

- @curvefi/api 2.67.2 (main protocol)
- @curvefi/llamalend-api 1.0.21 (lending and minting)
- Ethers.js 6.14.1
- BigNumber.js 9.3.0

**UI/Forms:**

- Styled Components 6.1.18 (we want to deprecate this in favor of curve-ui-kit)
- Material-UI based curve-ui-kit
- React Hook Form 7.56.4 (we want to deprecate this in favor of curve-ui-kit)
- Vest 5.4.6 (validation in new code)

## Development Patterns

### Feature-Sliced Design (FSD)

The codebase follows Feature-Sliced Design architecture:

- **Features**: Business logic grouped by user-facing functionality
- **Entities**: Core business models (pools, tokens, users)
- **Shared**: Reusable utilities, hooks, components

### Validation with Vest

Data validation should use Vest library with validation groups:

```typescript
// Example validation group
export const poolValidationGroup = ({ chainId, poolId }: PoolQueryParams) =>
  group('poolValidation', () => {
    chainValidationGroup({ chainId })
    test('poolId', () => {
      enforce(poolId).message('Pool ID is required').isNotEmpty()
    })
  })

// Usage
const isValid = checkValidity(poolValidationGroup, data)
const validatedData = assertValidity(poolValidationGroup, data)
```

### State Management

- **React Query** for any new code
- **Zustand** and **Immer** for old code (being deprecated)
- Local storage integration for user preferences

### Multi-Chain Support

- Supports 15+ blockchain networks
- Network-specific routing: `/[domain]/[network]/`
- Dynamic RPC configuration via environment variables
- Chain-specific state management and validation

## Wallet connection

The wagmi configuration in this Curve Frontend codebase is quite comprehensive. Here's how it's set up:

Core Configuration

Location: /packages/curve-ui-kit/src/features/connect-wallet/lib/wagmi/wagmi-config.ts

The wagmi config supports 26+ chains including Ethereum, Optimism, Polygon, Arbitrum, Base, and several custom chains like Hyperliquid and TAC.

Key Features

Transport Strategy:

- Primary: unstable_connector(injected) for user's wallet
- Fallback: HTTP transport with batch size 3 (DRPC compliance)

Supported Wallets:

- Browser/Injected wallets
- WalletConnect (project ID: 982ea4bdf92e49746bd040a981283b36)
- Coinbase Wallet
- Safe (iframe only)

Custom Chains: Includes Hyperliquid (999), TAC (2390), MegaETH (6342), Strata (8091), and EXPchain (18880)

The wallet gives a compatibility layer for ethersJS so it may be passed to CurveJS libraries.

### Integration

The config is wrapped around the entire app in ClientWrapper.tsx and integrates with a custom ConnectionContext that handles chain switching and coordinates with CurveJS libraries.
The UI uses a modal system with useConnection and useWallet hooks for wallet interactions.

## Environment Setup

### Prerequisites

- Node.js 22 (exact version required)
- Yarn 4.6.0

### Setup Steps

1. `git clone https://github.com/curvefi/curve-frontend.git`
2. `cd curve-frontend && yarn`
3. Configure environment variables as needed
4. `yarn dev` to start development server
5. Access at http://localhost:3000

### Testing Environment

The tests that use Cypress with Hardhat forked networks are not working.
The idea was to run forked nodes on ports `8545 + chainId` to allow testing against mainnet state.
However, starting up the fork takes forever and the tests are not stable.
In the future we want to use a test network like Sepolia for testing.
The existing codes that run every commit do not need any fork.

## Code Quality Tools

- **ESLint** with custom configuration
- **Prettier** for code formatting
- **TypeScript** strict mode
- **Husky** git hooks with **lint-staged**
- **Commitlint** for conventional commits
- Bundle analyzer for performance optimization

## Important Notes

- Always run `yarn typecheck`, `yarn format` and `yarn lint:fix` before committing
- Follow existing validation patterns with Vest
- Use `@tanstack/react-query` for new data fetching logic
- Try to get rid of duplicated code shared by multiple apps
- Use test networks when working with blockchain interactions
- UI components should use the curve-ui-kit package when possible
- The existing code is often not pure, so be careful when refactoring - use only immutable data structures
- Do not use hardcoded values but instead use constants/enums.
- In the codebase, data is sometimes set incorrectly to 0, '' or NaN when errors occur. Please leave the data as undefined or null, and actually display unexpected errors.
- Never use `any` or `ts-ignore` comments. If you need to, please create a type for it or ask for help.
- We are trying to get rid of all `eslint-disable-next-line react-hooks/exhaustive-deps` comments, feel free to refactor the code and add proper dependencies to the useEffect hooks. However, be careful not to create infinite loops.
