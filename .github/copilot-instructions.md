# Copilot Instructions for Curve Frontend

## Overview

Curve Frontend is a Next.js monorepo for DeFi protocols including DEX, lending, governance, and crvUSD. Uses Turborepo with domain-driven architecture across multiple blockchain networks.

### Core Technologies

- Next.js with App Router
- React
- TypeScript
- Node.js (exact version required)
- Yarn

## Key Architecture Patterns

### Domain Organization

Main app is organized by financial products under `/apps/main/src/app/`:

- `/dex`: Router swaps, pool management, pool creation
- `/crvusd`: crvUSD minting, collateral management
- `/lend`: LlamaLend lending/borrowing markets
- `/dao`: Governance, voting, veCRV features

Each domain follows this structure:

```
src/[domain]/
  components/     # Domain-specific React components
  store/         # Zustand state slices
  entities/      # Data models with React Query
  utils/         # Domain utilities
  hooks/         # Custom hooks
  types/         # TypeScript types
```

### Monorepo Structure

- **`/apps/main`**: Main Next.js app with App Router containing all domains
- **`/packages/curve-ui-kit`**: Shared UI components with Storybook
- **`/packages/ui`**: Additional UI components
- **`/packages/prices-api`**: Curve prices API client
- **`/packages/external-rewards`**: Campaign rewards configuration
- **`/tests`**: Cypress E2E tests with Hardhat node support

### State Management (Transitioning)

- **Old code**: Zustand + Immer for mutable updates (being deprecated)
- **New code**: @tanstack/react-query for server state (preferred for all new code)
- State slices use consistent patterns like `setStateByKey`, `setStateByActiveKey`, `resetState`
- All state updates use `cloneDeep` and `merge` from lodash
- Local storage integration for user preferences

### Feature-Sliced Design (FSD)

The codebase follows Feature-Sliced Design architecture:

- **Features**: Business logic grouped by user-facing functionality
- **Entities**: Core business models (pools, tokens, users)
- **Shared**: Reusable utilities, hooks, components

### Validation with Vest

Data validation uses Vest library with validation groups:

```typescript
export const poolValidationGroup = ({ chainId, poolId }: PoolQueryParams) =>
  group('poolValidation', () => {
    chainValidationGroup({ chainId })
    test('poolId', () => {
      enforce(poolId).message('Pool ID is required').isNotEmpty()
    })
  })

const validatedData = assertValidity(poolValidationSuite, data)
```

### React Query Patterns

```typescript
const { useQuery, invalidate } = queryFactory({
  queryKey: ({ chainId, poolId }) => ['pool', { chainId }, { poolId }] as const,
  queryFn: ({ chainId, poolId }) => fetchPoolData(chainId, poolId),
  validationSuite: poolValidationSuite,
})
```

## Essential Development Commands

```bash
# Development
yarn dev              # Start all apps in dev mode (localhost:3000)
yarn build            # Build all apps for production
yarn start            # Start production builds
yarn lint             # Lint all code
yarn lint:fix         # Fix linting issues automatically
yarn typecheck        # Run TypeScript checks across all packages
yarn format           # Format code with Prettier
yarn format:check     # Check code formatting without fixing

# Testing
cd tests
yarn cy:open:e2e      # Open Cypress E2E tests interactively
yarn cy:run:e2e       # Run Cypress E2E tests headless
yarn cy:open:component # Open Cypress component tests interactively
yarn cy:run:component  # Run Cypress component tests headless

# UI Kit Development
yarn storybook        # Run Storybook for UI components
yarn storybook:build  # Build Storybook static files

# Bundle Analysis
cd apps/main
yarn analyze          # Analyze bundle size (sets ANALYZE=true)
```

## Multi-Chain Architecture

- Supports 15+ networks with chain-specific routing: `/[domain]/[network]/`
- Chain validation in every query using `chainValidationGroup`
- Network configs in `/networks` with RPC URLs via environment variables
- Wallet connection via wagmi with custom chains (Hyperliquid, TAC, etc.)

## UI Component Strategy

- **curve-ui-kit**: Material-UI based shared components with Storybook
- **Styled Components**: Legacy styling (being deprecated)
- Form handling with React Hook Form (being deprecated in favor of curve-ui-kit)

## Wallet Connection

The wagmi configuration supports 26+ chains including Ethereum, Optimism, Polygon, Arbitrum, Base, and several custom chains like Hyperliquid and TAC.

### Key Features

- **Transport Strategy**: Primary unstable_connector(injected) for user's wallet, fallback HTTP transport with batch size 3 (DRPC compliance)
- **Supported Wallets**: Browser/Injected wallets, WalletConnect, Coinbase Wallet, Safe (iframe only)
- **Custom Chains**: Includes Hyperliquid (999), TAC (2390), MegaETH (6342), Strata (8091), and EXPchain (18880)
- **Integration**: Wrapped in ClientWrapper.tsx with custom ConnectionContext for chain switching
- **Compatibility**: Provides compatibility layer for ethersJS integration with CurveJS libraries

## Critical Patterns to Follow

### Blockchain Interactions

- Uses `@curvefi/api` (DEX) and `@curvefi/llamalend-api` (lending/minting)
- BigNumber.js for precise financial calculations (never use floating point), but transition to javascript's native `bigint` where possible
- Ethers.js for blockchain interactions for legacy code, but transitioning to Viem
- Viem utilities for address validation: `isAddress`, `isAddressEqual`, `zeroAddress`

### Error Handling

- Never use `any` or `ts-ignore`
- Leave data as `undefined/null` instead of setting to `0`, `''`, or `NaN` on errors
- Display unexpected errors instead of silently failing
- Use immutable data structures for all state updates

### File Naming & Structure

- Zustand slices: `createXxxSlice.ts` with typed interfaces
- React Query entities: domain-based in `/entities/` folders
- Validation: `xxx-validation.ts` files with Vest groups
- Components: Domain-specific in `/components/` folders

## Common Gotchas

### Dependencies

- Node.js (exact version required) with Yarn
- Never install dependencies without understanding the existing patterns
- Use workspace aliases: `@ui-kit`, `@curvefi/prices-api`

### State Updates

- Always use `produce` from Immer for Zustand updates
- Check equality with `lodash.isEqual` before state updates
- Use `cloneDeep` when updating nested objects
- Avoid infinite loops in `useEffect` - add proper dependencies

### Testing (Currently Limited)

- Cypress E2E tests exist but Hardhat forked networks are unstable
- Component tests use Cypress
- Future: Moving to Sepolia test network

## Network & Environment

- Development RPC URLs via `NEXT_PUBLIC_[NETWORK]_DEV_RPC_URL`
- Support for custom networks beyond standard chains
- DRPC batch size compliance (batch size 3)
- Wallet compatibility layer for ethers.js integration with CurveJS

## Code Quality & Conventions

- **ESLint** with custom configuration + **Prettier** for formatting
- **TypeScript** in strict mode
- **Husky** git hooks with **lint-staged** for pre-commit checks
- **Commitlint** enforcing conventional commits
- Always run `yarn typecheck`, `yarn format` and `yarn lint:fix` before committing
- Avoid `eslint-disable-next-line react-hooks/exhaustive-deps` - refactor to use proper dependencies
- Do not use hardcoded values - use constants/enums instead

## Important Anti-Patterns to Avoid

- **Never** use `any` or `ts-ignore` - create proper types instead
- Don't set error values to `0`, `''`, or `NaN` - leave as `undefined/null` and display errors
- Don't use floating point for financial calculations - use BigNumber.js or `bigint`
- Avoid creating infinite loops in `useEffect` - be careful with dependencies
- Don't refactor existing impure code carelessly - maintain immutable data structures

Use existing patterns consistently - this codebase values predictable conventions over individual creativity.
