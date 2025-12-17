# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development
yarn dev                # Start Vite dev server on localhost:3000
yarn build              # Build all packages for production
yarn start              # Preview production build
yarn lint               # Lint all code
yarn lint:fix           # Fix linting issues automatically
yarn typecheck          # Run TypeScript checks across all packages
yarn format             # Format code with Prettier
yarn format:check       # Check code formatting without fixing

# Testing
cd tests
yarn cy:open:e2e        # Open Cypress E2E tests interactively
yarn cy:run:e2e         # Run Cypress E2E tests headless (requires yarn dev first)
yarn cy:open:component  # Open Cypress component tests interactively
yarn cy:run:component   # Run Cypress component tests headless

# UI Kit Development
yarn storybook          # Run Storybook for UI components on port 6006
yarn storybook:build    # Build Storybook static files
```

## Architecture Overview

### Monorepo Structure

This is a **Yarn workspaces monorepo** with a Vite-powered React application:

- **`/apps/main`**: Main React app with TanStack Router containing all domains
- **`/packages/curve-ui-kit`**: MUI-based shared UI components with Storybook
- **`/packages/ui`**: Legacy UI components (being deprecated)
- **`/packages/prices-api`**: Curve prices API client
- **`/packages/external-rewards`**: Campaign rewards configuration
- **`/tests`**: Cypress E2E and component tests

### Domain Organization

The main app is organized by financial product domains under `/apps/main/src/`:

- **`/dex`**: Router swaps, pool management (deposit/withdraw/swap), pool creation
- **`/crvusd`** and **`/loan`**: crvUSD minting, collateral management, liquidation
- **`/lend`** and **`/llamalend`**: LlamaLend markets, lending/borrowing functionality
- **`/dao`**: Governance, voting, gauge management, veCRV features

Each domain follows Feature-Sliced Design:

```
src/[domain]/
  entities/           # Core business models with TanStack Query
  features/           # User-facing functionality
  components/         # Domain-specific React components
  store/              # Zustand slices (being migrated to TanStack Query)
  utils/              # Domain utilities
  hooks/              # Custom hooks
  types/              # TypeScript types
  lib/                # Domain-specific libraries
  layout/             # Layout components
  widgets/            # Complex UI components
```

### Key Technologies

**Core Stack:**

- Vite with React
- React 19 with TypeScript
- TanStack Router for routing
- TanStack Query for data fetching
- Node.js LTS version (required)
- Yarn 4 workspaces

**State & Data:**

- TanStack Query for server state (preferred for new code)
- Zustand for client state (being deprecated)
- Immer for immutable updates
- Vest for validation

**Blockchain:**

- @curvefi/api (main protocol)
- @curvefi/llamalend-api (lending and minting)
- Wagmi v2 + Viem (migration target)
- Ethers.js (being deprecated)

**UI/Forms:**

- curve-ui-kit (MUI-based, preferred)
- Styled Components (being deprecated)
- React Hook Form (being deprecated)

## Development Patterns

### TanStack Router

Routes are defined in `/apps/main/src/routes/` with a hierarchical structure:

```typescript
// Root route with global layout
export const rootRoute = createRootRoute({
  component: RootLayout,
})

// Domain layout route
export const dexLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dex',
  component: DexLayout,
})

// Feature route
export const poolRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/pool/$poolIdOrAddress',
  component: PagePool,
  head: () => ({ meta: [{ title: 'Pool - Curve' }] }),
})
```

### TanStack Query with queryFactory

The `queryFactory` pattern provides consistent query creation with built-in validation:

```typescript
import { queryFactory } from '@ui-kit/lib/model/query'

// Define query with validation
export const { useQuery: usePoolData, invalidate: invalidatePool } = queryFactory({
  queryKey: (params: PoolParams) => ['pool', params] as const,
  queryFn: async ({ chainId, poolId }) => {
    const curve = await getCurve(chainId)
    return curve.getPool(poolId)
  },
  staleTime: '5m', // Uses REFRESH_INTERVAL constants
  validationSuite: poolValidationSuite,
})

// Usage in component
const { data: pool, isLoading } = usePoolData({ chainId, poolId })
```

### Mutations with TanStack Query

```typescript
export const useAddRewardToken = ({ chainId, poolId }: GaugeParams) => {
  return useMutation({
    mutationKey: ['addRewardToken', { chainId, poolId }],
    mutationFn: async (params: AddRewardMutation) => {
      const curve = await getCurve(chainId)
      return curve.gauge.addRewardToken(params)
    },
    onSuccess: (resp, { rewardTokenId }) => {
      notify(t`Added reward token ${rewardTokenId}`, 'success')
      return queryClient.invalidateQueries({ queryKey: ['distributors', { chainId, poolId }] })
    },
    onError: (error) => {
      notify(t`Failed to add reward token`, 'error')
    },
  })
}
```

### Validation with Vest

```typescript
import { group, test } from 'vest'
import { enforce } from 'vest/enforce'

export const poolValidationGroup = ({ chainId, poolId }: PoolParams) =>
  group('pool', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID required').isNotEmpty()
      enforce(chainId).message('Invalid chain ID').isNumber()
    })
    test('poolId', () => {
      enforce(poolId).message('Pool ID required').isNotEmpty()
    })
  })

// Create validation suite
export const poolValidationSuite = createValidationSuite(poolValidationGroup)

// Use validation
const isValid = checkPoolValidity(params)
const validated = assertPoolValidity(params)
```

### Wagmi Configuration

Located in `/packages/curve-ui-kit/src/features/connect-wallet/lib/wagmi/`:

```typescript
// Configuration supports 26+ chains
export const createWagmiConfig = memoize(({ chains, transports, connectors }) =>
  createConfig({
    chains,
    connectors,
    transports,
    multiInjectedProviderDiscovery: false, // Prevent auto-reconnect issues
  }),
)

// Usage via ConnectionContext
const { wallet, provider, chainId, switchChain } = useConnection()
```

### Storybook Stories

UI components in curve-ui-kit should have accompanying stories:

```typescript
// Example: Button.stories.tsx
export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
    },
  },
} satisfies Meta<typeof Button>

export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'contained',
  },
}
```

### Cypress Testing

- **E2E Tests**: Located in `/tests/cypress/e2e/`
- **Component Tests**: Located in `/tests/cypress/component/`
- Use `cy.` commands for assertions and interactions
- Tests run against localhost:3000 (dev server must be running)

## Migration Guidelines

**Zustand → TanStack Query**:

- Create new queries with `queryFactory`
- Replace store slices gradually
- Keep Zustand only for true client state (UI preferences)

**Ethers → Viem/Wagmi**:

- Use Viem utilities for new code
- `isAddress`, `isAddressEqual`, `zeroAddress` from viem
- Maintain compatibility layer for CurveJS

**Styled Components → curve-ui-kit**:

- Use MUI-based components from curve-ui-kit
- Create new components with MUI's sx prop or styled()

**React Hook Form → Controlled components**:

- Use controlled components with local state
- Validate with Vest
- Submit with TanStack Query mutations

## Important Notes

- Always run `yarn typecheck`, `yarn format` and `yarn lint:fix` before committing
- Use `queryFactory` pattern for all new data fetching
- Prefer immutable data structures with Immer
- Never use `any` or `@ts-ignore` - create proper types
- Handle errors explicitly - avoid setting data to 0, '', or NaN on error
- Fix `eslint-disable-next-line react-hooks/exhaustive-deps` warnings properly
- Use constants/enums instead of hardcoded values
- New UI components should go in curve-ui-kit with Storybook stories
- Network-specific routing pattern: `/[domain]/[network]/[feature]`
- Query keys should be arrays with consistent structure: `['entity', params]`
