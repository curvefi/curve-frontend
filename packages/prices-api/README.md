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
- Runtime-validated responses using Zod schemas
- Typed responses using TypeScript
- Tree-shakeable exports

## Endpoint Tests

The live endpoint suite validates Prices API endpoints through the exported wrapper functions in `src/*/index.ts`. It is opt-in and runs with:

```bash
yarn workspace @curvefi/prices-api test:endpoints
```

The suite uses Vitest's tree reporter with skipped tests hidden. Completed cases keep the nested suite structure, and any case still running after the 500ms slow-test threshold appears in the live summary with its elapsed time.

When an endpoint case fails, the test harness annotates the failure with the active `PRICES_API_TEST_SEED` and the complete fetch URL captured during that case.

### Catalog guard

`tests/catalog.ts` is the shared coverage guard for the endpoint suite. It scans every `src/*/index.ts` file for exported async wrapper functions and compares those wrappers against the `endpointCase(...)` calls in `tests/endpoints/*.test.ts`.

`tests/catalog.test.ts` is intentionally small. Its job is to make the guard fail loudly when the catalog is stale:

- `missing`: an exported async wrapper exists in `src/*/index.ts` but has no endpoint test case.
- `staleCases`: an endpoint test case points at a wrapper that no longer exists.
- `staleExclusions`: an explicit exclusion points at a wrapper that no longer exists.

The live endpoint tests also call the catalog guard before making network requests. If the catalog is stale, each live endpoint test is skipped so the run fails only on `catalog.test.ts` instead of also making a large number of avoidable live API calls.

`solver.getCompetition` is currently the only explicit exclusion because there is no live seed source for it inside `prices-api`.

### Seed discovery

Use `endpointSeed(...)` from `tests/seeds.ts` for live values that are needed as endpoint parameters. It loads seeds in `beforeAll`, so Vitest's per-test duration and slow-test threshold measure the endpoint wrapper call rather than seed discovery. Seed load failures are cached and rethrown only by endpoint cases that read that seed, so one bad seed does not abort an entire endpoint file.

Random live seed selection is deterministic. Set `PRICES_API_TEST_SEED` before running the suite to make a run reproducible, or reuse the `endpoint-seed` annotation printed on a failure:

```bash
PRICES_API_TEST_SEED=debug-2026-05-13 yarn workspace @curvefi/prices-api test:endpoints
```

Endpoint files run serially, but endpoint cases inside each file use `it.concurrent`. `PRICES_API_TEST_CONCURRENCY` controls that per-file live API fan-out and defaults to 6. Isolation is disabled so the `once(...)` seed loaders in `tests/seeds.ts` can reuse live seed discovery across endpoint files.

## Build

```bash
yarn workspace @curvefi/prices-api build
```

This build is more involved than a typical package build because `prices-api` uses shared `@primitives/*` utilities internally while keeping the published package free of internal workspace runtime dependencies.

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
