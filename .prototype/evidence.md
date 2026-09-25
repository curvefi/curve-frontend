# Position card evidence notes

Prepared with the prototype. These notes record what was checked. They do not verify a live deployment.

## Baseline recorded in Phase 1

- HEAD `c00c26336e` on `codex/llamalend-position-card-prototype`, tracking `origin/main`.
- Node `v24.20.0`. Yarn `4.17.1` (`packageManager` `yarn@4.17.1`).
- Lockfile present: `yarn.lock`. `@curvefi/llamalend-api` lock is 2.5.2.
- Implementation was uncommitted when this baseline was taken. Existing work was kept.

## PR 3285

Classification PR 3285 was OPEN at `ae79a508`. That pull request supplies a correlated/volatile split and a small explicit long-tail address list. It does not assign Blue-chip, and it does not justify copying every volatile controller into Blue-chip as a sourced fact.

`MARKET_ASSETS_TYPE_BY_CONTROLLER` in this worktree is a prototype mapping. Correlated entries follow the former stable set. Blue-chip and Long-tail entries are explicit addresses maintained here. They are provisional where they are not an approved product decision. There is no second registry and no automatic volatile-to-Blue-chip rule.

Slippage still comes from `MARKETS_LEVERAGE_CONFIG`. This mapping does not change it.

## Snapshot

`position-metrics/snapshot.ts` reads loan existence, user state, full health, user prices, the oracle, and tick indices in one `multicallProvider.tryAll` at one `blockTag`. A failed call becomes an unavailable field. Full health does not wait on discounts or non-full health. The beta buffer reads that field.

The snapshot's liquidation predicate is `unverified`. Source inspection of Controller `health` is not a matched deployment, so the card must not claim a verified Healthy or Liquidatable state from it.

## What is not established

- No Controller family has a recorded source-match, address, predicate, and block. There is no allowlist.
- Range liquidity is still summed from market band balances. The follow-up requires that field to leave the card.
- Leverage for mint still uses the deposit-ratio heuristic in `BorrowInformation`. That is not the current-loan event selector.

## Checks

Recorded after the Phase 1 commands in this worktree. Node `v24.20.0`.

- [x] `yarn workspace @curvefi/tests test` — Vitest 4.1.11, 11 files, 151 tests passed. Discovered `apps/main/src/llamalend/features/market-position-details/position-metrics.utils.spec.ts` (11) and `apps/main/src/llamalend/market-assets-type.utils.spec.ts` (3). The tests workspace script calls the root `vitest.mjs` because that workspace's install does not hoist the `vitest` binary (`command not found: vitest` before the script change). `apps/main/src/llamalend/hooks/usePriceImpact.spec.ts` is excluded: it imports the wallet connector, which reads `window` at load, and it is not one of the new node specs.
- [x] Targeted ESLint on the card helpers and `position-metrics/provenance.ts` exited 0. `leverage-eligibility.utils.ts` uses `toSorted`.
- [x] `node_modules/.bin/tsc -p apps/main/tsconfig.json --noEmit --incremental --tsBuildInfoFile /tmp/llamalend-phase1.tsbuildinfo` reports no error in `BorrowPositionDetails` or `position-metrics/provenance.ts`. The previous TS2339 on `dataUpdatedAt` is gone. Four `TS2559` `ProcessEnv` errors remain, all under `../curve-frontend/` (`apps/merkl-api/src/server.ts`, `apps/router-api/src/server.ts`, `packages/api-server/src/index.ts`). They are the sibling checkout, not this branch.
