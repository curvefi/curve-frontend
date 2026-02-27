# @curvefi/prices-api

JavaScript library for Curve Finance Prices API.

## Installation

```bash
npm install @curvefi/prices-api
```

## Usage

```typescript
import { getMarkets } from '@curvefi/prices-api/crvusd'

// Get crvUSD markets for Ethereum
const markets = await getMarkets('ethereum')
```

## Features

- Chain data (TVL, volumes, fees)
- crvUSD / LlamaLend markets and user positions
- DAO data (votes, locks, gauges)
- Typed responses using TypeScript
- Tree-shakeable exports
- Zero dependencies

## Build

```bash
yarn workspace @curvefi/prices-api build
```

This build is more involved than a typical package build because `prices-api` uses shared `@primitives/*` utilities internally while keeping the published `@curvefi/prices-api` package dependency-free.

### Build steps

Internally, the build runs:

1. `yarn build:deps` (`yarn workspace @curvefi/primitives build`)
2. `yarn build:js` (Vite bundle)
3. `yarn build:types` (`tsc` for type declarations)

### Why this exists

In `packages/prices-api/vite.config.ts`, Vite aliases `@primitives` to `../primitives/src` during the bundle, so `prices-api` can share code from the workspace without publishing `@curvefi/primitives` as a runtime dependency.

The config also rewrites sourcemap source labels (see `packages/prices-api/vite.config.ts:12`) so published sourcemaps do not expose workspace-relative paths.

## License

MIT
