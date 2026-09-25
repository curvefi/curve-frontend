# Llamalend prototype review and Cursor follow-up plan

## Verdict

The prototype is a partial implementation, not ready for a coherent coworker review. The core price-ratio, composition and APR arithmetic is a useful starting point. The integration still mixes old/new semantics, ignores verification gates, does not implement the priority swap, and lacks usable regression/story coverage. Fix the data/model layer before spreading the current card implementation to more surfaces.

Review target: `/Users/ndrik/Documents/Projects/Crypto/Curve/curve-frontend-llamalend-position-card`, branch `codex/llamalend-position-card-prototype`, base/HEAD `c00c26336e`. Reviewed tracked modifications AND untracked helper/spec files. The implementation was uncommitted. The original saved checkout is not the prototype checkout. Do not discard either checkout's work.

This document is review and planning only. No implementation files were changed during review. Paths below are relative to the prototype root unless stated otherwise. Line references describe this reviewed working tree, not future edits. The prior approved specification remains authoritative where this document does not supersede it.

## Findings, ordered by impact

### F01 — P1: the new card still displays contradictory legacy liquidation alerts

Evidence: `features/market-position-details/BorrowPositionDetails.tsx:30,54,93` (all feature paths in this document are under `apps/main/src/llamalend/` unless prefixed otherwise). New status uses full health, but `useLiquidationStatus` and `getPositionStatusContent` still drive the bottom alert outside the feature-flag branch. `llama.utils.ts::getLiquidationStatus` uses non-full health < 0. `position-status-content.tsx` still says Health reaches 0, protection is active, and losses reduce health.

Reproduction: full health positive, non-full negative, oracle above range. The new badge can be Healthy/Near range while the old alert says the position can be hard-liquidated. Inside range, the alert tells users to monitor a Health value that the new model intentionally clamps at 1.

Fix: a single new presentation status must drive badge, colors, hierarchy, and presentation alerts. Keep legacy status only on the flag-off path or where transaction eligibility still needs its existing separate semantics. Never globally repurpose the old helper without auditing all callers.

Acceptance: the positive-full/negative-non-full fixture never emits the legacy hard-liquidation alert in prototype mode. In-range copy refers to buffer, not a Health decline to zero.

### F02 — P1: verification is hardcoded rather than established

Evidence: `BorrowPositionDetails.tsx:44` and `health/HealthDetails.tsx:144` pass `liquidationPredicate: 'strict-negative'` for every market. `.prototype/evidence.md` explicitly says live deployments were not verified. `position-status.utils.ts` has an unverified path, but real callers bypass it.

Mechanics evidence: inspected source `curve-stablecoin` commit `dc7f6c9546779527290c5af30d27e421acf17afd`, `curve_stablecoin/controller.vy::_health`, `liquidate`, and `health` uses full health and strict <0 for unapproved third parties. This is SOURCE evidence, not matching-deployment evidence for all markets. SDK 2.5.2 `lendMarkets/modules/common/userPosition.ts::userHealth` establishes ABI call/scaling only.

Fix: verified implementation metadata resolved by chain/Controller/version or proven implementation identity; unsupported variants have an explicit unverified state. Complete representative deployment matching rather than claiming all markets verified or leaving all useful live cases unsupported indefinitely. Do not fabricate an allowlist of predicates from token symbols.

Acceptance: unverified variant cannot show a verified Healthy/Liquidatable claim. Evidence records contain source match, addresses, predicate and block for each enabled family. Self/approved close remains distinct from third-party eligibility.

### F03 — P1: no coherent position snapshot; unrelated failures suppress buffer

Evidence: `BorrowPositionDetails.tsx:32–35`, `HealthDetails.tsx:120–128`, `BorrowInformation.tsx:151–209` combine independently timed calls. Full health is read from `health.data.debug.healthFull`; `queries/user/user-health.query.ts:59–99` requires non-full health AND discounts before exposing that debug object. SDK caches oracle for 60s and user state for 10s; Promise.all cannot fix this.

Impact: mixes pre/post-action debt, health, assets and moving range boundaries. Valid full-health buffer disappears when an unnecessary discounts/non-full request fails. Loading/error states describe the old health bundle, not the new metric.

Fix: direct, block-tagged position snapshot for debt, balances, oracle, boundaries and full health; per-field availability with common provenance. Eliminate the production dependency on optional debug fields. Use existing query/provider/ABI infrastructure and invalidation, no new store or parallel application data layer.

Acceptance: prove one common block for risk inputs; full-health buffer survives a failed legacy discount read; unchanged price plus interest still refreshes debt/boundaries/buffer. A failed batch cannot blend old and new values unnoticed.

### F04 — P1: ROE fabricates borrowed-asset yield and fails capability/availability rules

Evidence: `BorrowInformation.tsx:193–208` always assigns nonzero converted assets `{aprFraction: ZERO}`. It returns early if collateral APR is null even when collateral balance is zero. `:328–337` renders ROE for every market without a yield-capability check. `position-roe.utils.ts:16–17,54–56` turns omitted/unverified rewards into zero; the multiplier denominator only uses intrinsic collateral APR.

Impact: wrong ROE on supported borrowed assets with yield, unavailable fully converted ROE when its now-irrelevant collateral yield is missing, ROE clutter for non-yield collateral, and future LP rewards silently omitted or compared to the wrong reference.

Fix: model known-zero / known-value / unavailable / unnecessary explicitly at the input boundary. Determine yield eligibility separately from today's numeric rate. Only ignore an unavailable yield when its earning balance is zero. Unknown required rewards cannot become zero. Use the same verified intrinsic/reward sources and reward assumptions in the unleveraged reference rate. Do not add lender CRV rewards to borrower income.

Acceptance: non-yield market hides ROE; yield-capable missing feed shows unavailable; fully converted positive-equity position still calculates known costs; borrowed yield changes numerator; unknown nonzero earning balance blocks the estimate; reward-only LP fixture uses its eligible reference APR, with no live support claim until verified.

### F05 — P1: mint leverage eligibility still uses the rejected deposit heuristic

Evidence: `BorrowInformation.tsx:220–238` uses totalDeposit/totalDepositFromUser for mint and calls `isPositionLeveraged`, while lending uses current-loan events. It also forces `nullMeansOrdinaryBorrow: true` without evidence. `leverage-eligibility.utils.ts:26–57` ignores `page`, sorts solely by timestamp, and treats any non-null metadata as qualifying.

Impact: old loan history can leak into a reopened mint position; missing route metadata is treated as proof of ordinary borrowing; close/reopen transactions sharing a timestamp can be misordered. Unknown eligibility is silently hidden without the requested diagnostic.

Fix: one current-loan eligibility selector for lend AND mint, based on verified event semantics and deterministic ordering. Preserve count/page/pagination. Verify endpoint completeness; page count is not assumed from a nullable field. Use block/transaction/log ordering if supplied, otherwise resolve ambiguous episodes using receipt evidence or return unknown. Qualifying leveraged create/manage event types must be explicit. Preserve yes/no/unknown and reason through presentation.

Acceptance: leverage-close-ordinary-reopen, reversed same-timestamp events, partial liquidation, incomplete page, absent metadata, mint/lend parity. No numerical leverage/deposit heuristic controls visibility.

### F06 — P1: new/old metric meanings disagree throughout the rest of the product

Evidence: `widgets/action-card/LoanActionInfoList.tsx:142–159` labels historical Controller health as Health; full repay shows infinity. `hooks/useHealthQueries.ts` selects negative non-full or full health. `LoanActionInfoList.tsx:227–236` still computes APY-based ROE gated by leverage. `queries/market-list/llama-market-stats.ts:25–37` normalizes old status and historical health; `features/market-list/cells/HealthCell.tsx` formats it as %. `features/market-participants/market-participants.utils.tsx::Health` displays API health as %. Max ROE paths still use APY.

This is now explicitly in scope. A reviewer can read Health 1.11 on the card and a very different percentage under the same name in the form/table. Do not rename a percentage to a ratio or add 1 as a shortcut. Implement the cross-surface migration in phase 6 below.

### F07 — P1: typecheck regression and misleading refresh timestamp

Evidence: `BorrowPositionDetails.tsx:50–53` accesses `dataUpdatedAt` on a union containing stripped `QueryProp` results; tsc reports TS2339. It chooses MAX timestamp, omits full-health freshness, and thereby presents the newest component as the age of the whole set.

Fix: use typed snapshot provenance, not properties lost through q/mapQuery/combineQueries. For independent rates/history show their own ages. If interim mixed data is shown, disclose the oldest required input, not the newest. Do not silence with `as any`.

Acceptance: typecheck passes for changed paths; stale full health with fresh oracle cannot appear freshly verified.

### F08 — P2: buffer-first hierarchy never happens

Evidence: `BorrowPositionDetails.tsx:22–24` both desktop layouts begin `health range buffer collateral`; mobile areas never depend on lead. Only debt/leverage/ROE move. Both metrics remain same component hierarchy. `HealthDetails.tsx:151,202` colors the buffer error whenever a non-Info buffer lead exists, including ordinary protection.

Fix: actually swap the primary/secondary Health and buffer slots in visual AND reading order for inside/below/critical/liquidatable states. Use severity mapping for color, not a boolean emphasis-to-red conversion. Fully converted Info state still requires buffer prominence. Do not move unrelated economics when risk priority changes.

Acceptance: rendered mobile and desktop assertions prove buffer is first/prominent in all applicable states; adequate-buffer protection is not red; low buffer uses Danger and critical uses Error consistently.

### F09 — P2: tooltip text contradicts both agreed model and implemented predicate

Evidence: `PositionMetricTooltip.tsx::bufferTooltip` says eligibility begins at 0%, but resolver tests <0. `statusTooltip` lists obsolete Hard liquidation/Below range rather than actual statuses and omits category/thresholds. `healthTooltip` still says protection active. Range tooltip omits directional distance equations and recovery-loss warning; collateral tooltip lacks equation, composition equation and token balances; buffer lacks amount equation; leverage omits yield amplification; ROE lacks reference APR/multiplier math and expanded input rates. Several rendered equations omit an equals sign. Every Learn More link points to the old model's general page.

Fix: replace drafts with the accepted final copy and equations, not the earlier Figma placeholder wording. Add numeric inputs/units, category and provisional threshold to the appropriate tooltip. Link local prototype calculation notes if published docs contradict the prototype; don't present old docs as authoritative for new Health. Ensure mobile click/focus access and accessible linear equations for visual fractions.

Acceptance: screenshot/text checks for every metric, exact zero, recovery, intrinsic yield multiplication, buffer amount and reference APR. All displayed formulas evaluate to the same fixture values as the UI.

### F10 — P2: refresh failures are hidden for economics

Evidence: duplicated `keepDisplayedValue` in `HealthDetails.tsx:40` and `BorrowInformation.tsx:44` nulls errors. Parent `watched` array excludes rates, rate snapshots, history and band-liquidity queries. No persistent as-of label exists on success, no retry is supplied, and status does not have its own unavailable/loading explanation. ROE may retain old rates with no update warning.

Fix: retain values AND freshness/error provenance; metric-level availability reasons with one aggregate risk freshness indicator. Don't manufacture successful queries to fool Metric. Preserve last-known warning with a stale label; clear identity-dependent values on account/chain/market changes.

Acceptance: a yield-feed refetch failure leaves marked old ROE, not silent success; risk metrics remain usable; unavailable states name their missing input.

### F11 — P2: invalid numeric inputs become plausible values

Evidence: `position-metrics.utils.ts::oracleHealth` returns 1 for upper<=0; `priceDistance` calls nonpositive price In range. `HealthDetails.tsx:165,203` fallbacks manufacture 1 or 0; `position-roe.utils.ts::amount` and final decimal conversion default to zero. No boundary validates reversed endpoints, nonfinite/negative balances or unsupported prices.

Fix: validate canonical inputs once, preserving legitimate negative health/equity/APR; invalid oracle or bounds produce unavailable with reason. Remove silent safe-looking fallback numbers. Use decimal operations consistently instead of Number round trips for rates.

Acceptance: p=0, u=0, l>u, NaN/Infinity/malformed data never become In range/Health 1/ROE 0; zero balances remain valid; negatives remain valid only in fields that permit them.

### F12 — P2: provisional category decisions are presented as sourced facts

Evidence: `markets.constants.ts:513+` says all former volatile entries map to Blue-chip, while several become Long-tail. `.prototype/evidence.md` says Long-tail assignments were copied from PR #3285, which supplied stable/volatile, not Long-tail. `position-status.utils.ts:14–18` uses arbitrary 8/12/18% proximity and 6/8/10% low-buffer settings, but the UI doesn't expose their provisional nature or actual thresholds.

Fix: distinguish approved category assignments from suggested prototype assignments; record provenance honestly and require a maintained explicit mapping. Exactly three category labels. Show the active warning thresholds and prototype status in tooltip/legend. These current numbers are not calibrated, and 8% correlated proximity may be far too broad for intended testing; do not merely bless them because tests pass.

Acceptance: reviewer can see category and thresholds, change documented prototype config and see matching text/color changes. No new automatic volatile-to-Blue-chip rule. Slippage behavior remains unchanged.

### F13 — P2: added range liquidity lacks agreed semantics and adds expensive reads

Evidence: `BorrowInformation.tsx:170–174,211–218,276` fetches all market band balances and sums totalValue over user band indices. `queries/bands/bands-balances.query-helpers.ts` values collateral at band geometric-mean price, not current oracle, and reads prices for populated market bands. This is market-wide value in selected bands, not the user's position value or guaranteed conversion capacity.

Fix: remove the field/query from the prototype card as the original plan directed until its meaning is specified. If retained in a separately justified advanced view, name the market-wide scope and valuation basis explicitly, reuse chart data without initiating a full market-band fan-out merely for a tooltip.

Acceptance: opening a card does not trigger the extra whole-market band computation for this undefined field.

### F14 — P2: tests are not integrated; passing unit cases leave important branches unasserted

Evidence: new specs live under `apps/main/src`, while `tests/vitest.config.ts` includes only `../packages/*/src/**`. Standard direct runner finds no files. A temporary config executed both specs successfully (14 tests), but some ROE tests assert only inside `if (result.status === 'value')`, so an unavailable regression can pass. Category spec reimplements slippage lookup rather than invoking production behavior. No new component coverage or changed stories exists.

Fix: integrate discovery through the maintained config; make discriminant assertions mandatory before value assertions; test actual shared helpers, not copies. Add consumer-level tests for query availability, alerts, lead order, flag paths and previews/tables.

Acceptance: checked-in documented command discovers the actual tests; intentionally returning unavailable fails the mixed/converted ROE tests; regression cases below pass.

### F15 — P2: old stories don't exercise the new card's dependencies

Evidence: unchanged `BorrowPositionDetails.stories.tsx` lacks controller/category, yield/history/rate and coherent snapshot fixtures. Browser review at local Storybook 6007 showed Healthy story rendering **Above range**, ROE **N/A**, no leverage; token USD notional was served separately, demonstrating uncontrolled ancillary data. The story still uses old full/non-full fixture derivations and a synthetic market context.

Fix: complete deterministic fixtures for every required query. Disable real network fallthrough. Name stories after expected states and assert them. Separate live examples from offline fixtures.

Acceptance: Healthy actually renders Healthy; leveraged and ROE variants display their values; converted/liquidatable/reopen/stale/unknown stories load without wallet or network.

### F16 — P2: coworker walkthrough is not supplied

Evidence: `.prototype/` only contains original plan and evidence notes; no runbook/evidence matrix. `MarketContextProvider.tsx` sources userAddress from `useConnection`; local market list asks users to connect to view positions. No read-only address testing flow or complete action-form fixture suite was added.

Fix: a small read-only viewed-address mode and deterministic scenario links, with explicit separation of viewed account from signer. Use existing routing/market selection; no fake wallet connection. Mutation submission disabled in viewed-address/scenario mode. Coworkers must be able to inspect all screens without holding a position or signing.

Acceptance: fresh browser, no wallet, documented steps reach at least one realistic position per category plus converted and edge-case fixtures, action previews and tables. No console injection or devtools required.

### F17 — P2/P3: component architecture duplicates orchestration and hides coupled behavior

Evidence: parent and BetaHealthDetails independently fetch the same inputs and resolve status; repeated query subscriptions needlessly duplicate ownership even if TanStack deduplicates requests. `BorrowInformation.tsx` is 341 lines combining API/history/market-band reads, accounting, eligibility, formatting and layout. `HealthDetails` conditionally falls back to old semantics when MarketContext is absent. Duplicate error-clearing wrappers, hardcoded literal labels outside i18n, hand-built status chip, inconsistent number precision and unnecessary `d/requireDecimal` wrappers make semantics harder to maintain.

Fix: one thin orchestration hook + pure shared derivation; presentation receives typed metrics/status and has one branch-level feature gate. Reuse semantic typography/Chip/Metric and formatters. Keep only abstractions with multiple concrete consumers. Localize status/distance/multiplier labels at rendering; calculation helpers return keys, not English text. Remove whitespace-only invalidation change. Don't build a generic finance framework.

Targeted ESLint currently fails `leverage-eligibility.utils.ts:34` for mutable sort. Use `toSorted` or established immutable helper. This is lower priority than the accounting issues but must be clean before handoff.

## Review validation performed

- Read tracked diff, new helpers/specs, original plan and evidence notes; traced card queries, SDK semantics already established in original evidence, legacy alert resolver, action-info consumers, market list and participant schemas.
- Main typecheck: `node_modules/.bin/tsc -p apps/main/tsconfig.json --noEmit --incremental --tsBuildInfoFile /tmp/llamalend-review.tsbuildinfo` FAILED. New TS2339 at BorrowPositionDetails:51. Four additional ProcessEnv errors resolve into sibling original checkout API-server files; they are not demonstrated to originate in this change. No claim of a clean baseline.
- Targeted ESLint on eight changed/new card/helper files FAILED with one mutable-sort error.
- `yarn workspace @curvefi/tests test ...` failed command discovery (`vitest` unavailable in that workspace's execution environment). Root direct Vitest with repository config reported no matching tests. A temporary config in /tmp with correct includes/aliases ran both new spec files: **2 files, 14 tests passed**. This does not fix repository test discovery.
- Local app 3000 loaded in Beta mode. Market list rendered, Your Positions required connection. Storybook 6007 Healthy story rendered the incomplete values noted above. This is a spot check, not a completed mobile/theme/accessibility or real-position audit. No wallet connected, transaction signed, or external publish performed.

## Follow-up execution contract

Work on the existing prototype branch/worktree. Do not recreate the original prototype or revert Cursor/user edits. First record current status and diff, then implement the steps below sequentially. The new requested scope explicitly includes action forms/actionInfos, market discovery and personal/user position tables; do not stop after fixing the card.

Keep exactly **Correlated / Blue-chip / Long-tail**. Preserve approved names and calculations. Do not reopen settled product choices: Health ratio with clamp at 1, range distances both ways, debt-relative buffer and amount, Collateral value including converted assets, exposure/equity leverage only for verified leveraged loan episodes, composition ROE APR for yield-capable collateral, and net yield multiplier secondary line.

This is a display/data prototype, not a protocol-write redesign. Existing allowance, slippage, route, liquidation-action availability and transaction safety logic must not be switched to the new clamped Health. No global find/replace of `health`. No new dependencies unless a concrete gap requires one. No production publication/merge is authorized by this document.

## Phase 1 — Establish a truthful, runnable baseline

1. Snapshot the current diff and record HEAD/lockfile/Node/Yarn versions. Keep all existing work. Recheck PR #3285 integration state; avoid a duplicate registry when reconciling main.
2. Fix TS2339 by introducing typed provenance in the snapshot layer, not casting away the error. Record any unrelated baseline typecheck failures separately with before/after evidence.
3. Fix targeted lint and integrate specs into checked-in test config with needed aliases. Make the normal workspace test command executable under supported dependency setup; document the exact successful invocation and node runtime.
4. Correct `.prototype/evidence.md`: no copied Long-tail assignments claim, no implied deployment verification, no same-block claim before implementation. Add a checklist with links to actual passing checks and screenshots.

Exit: standard test command discovers the new tests; no new type/lint failures; evidence notes describe reality.

## Phase 2 — One shared metrics model, minimal data adapters

Create a small shared feature/module under `apps/main/src/llamalend` accessible to card, forms and tables (e.g. `position-metrics/`). Move/refine current pure helpers rather than clone them into every screen. Suggested responsibilities, not a demand for one file each:

- canonical input normalization/validation;
- pure metric derivation;
- status/severity resolution and formatting;
- current-position snapshot query;
- projected-position input adapter for each action family;
- yield and current-loan history selectors;
- presentation tooltip builders.

Canonical names must disambiguate values: `oracleHealthFactor`, `liquidationBufferPct`, `liquidationBufferAmount`, `collateralTokenAmount`, `borrowedAssetInAmm`, `collateralValue`, `remainingCollateralValue`, `equity`, `directionalLeverage`, `roeAprPct`, `collateralReferenceAprPct`. Avoid ambiguous generic `health` crossing UI/protocol boundaries.

Required provenance: identity (chain/Controller/user), input block and observation timestamp, source kind (live/preview/fixture), rates as-of, independent availability reasons, liquidation predicate verification and leverage-history eligibility. This is one focused view model, not a new global store. Consumers must not compute alternate formulas.

Snapshot: one block-tagged batch via established provider/multicall; current debt, AMM balances, oracle, user prices, full health and optional tick indices. Decode decimals and tuple order once. Let a failed field invalidate only dependent calculations where calls permit independent results. No-health/no-range loan-closed responses are an explicit closed state. Do not use optional `debug` as API.

Maintain current/preview quantities as decimals; no formatted parsing, Number for monetary arithmetic, hidden fallback 0/1, or `%` rescaling twice. Validate p>0, u>=l>0, nonnegative token balances/debt; retain negative equity/buffer/APR as meaningful. Add source-match metadata for supported Controller families. Unverified comparisons cannot assert safety.

Snapshot query key includes chain/Controller/user; preview keys additionally include action type, all amount inputs, N/range, route identity and other SDK-required parameters. Stale route/amount preview cannot overwrite the newest draft. Existing mutation invalidation must refresh the shared snapshot plus history/list adapters after confirmed success, not merely after submission.

Exit: a single fixture produces identical raw metrics independent of consuming surface; full-health data no longer depends on discounts/non-full reads; rejected inputs produce unavailable, not plausible metrics.

## Phase 3 — Repair history, yield inputs and categories

History: raw maintained `features/user-position-history/queries/user-{lend,crvusd}-collateral-events.ts`; both schemas preserve pagination. Resolve current loan episode and known leverage management with evidence for route coverage, not deposit ratios. Preserve unknown reason. Add close/reopen, equal timestamps, partial liquidation and incomplete response tests. Use receipts only for scoped verification, not an unbounded history scan for every render.

Yield capability is stable market/token metadata separate from APR observation. Non-yield hides ROE. Eligible-but-unavailable retains row with reason. Gross borrow APR only. Explicit applicable borrowed-asset yield; verify rebasing/debt denomination for unusual borrowed tokens. Zero balance makes corresponding income rate unnecessary. Unknown reward entitlement/feed is not known zero. Keep future reward-only fixtures without inventing a live rewards API. Reference APR for multiplier includes same supported intrinsic/reward assumptions. Negative/reference-zero/missing behavior matches original plan.

Categories: reconcile explicit assignments, distinguish tentative choices, and expose provisional thresholds. Values remain editable together, with contract liquidation predicate outside editable threshold config. Keep routing/slippage unchanged; test production lookup, not a copy. No automatic classification by symbol.

Exit: ROE/visibility/history tests cover all null/zero/negative distinctions; categories and thresholds have honest provenance and inspectable UI.

## Phase 4 — Repair card, tooltips and presentation states

Files: `BorrowPositionDetails.tsx`, `BorrowInformation.tsx`, `health/HealthDetails.tsx`, `PositionMetricTooltip.tsx`, `position-status-content.tsx` and local helpers.

1. Consume one view model and status. Remove duplicate resolution/query orchestration and legacy alert mixing from prototype path. Flag-off path remains isolated.
2. Health primary above range; buffer primary inside/below and critical/liquidatable. Reorder actual semantic reading order as well as visual prominence. Mobile must implement the same choice. Low-buffer emphasis may lead as already implemented by resolver, but use one explicit rule everywhere.
3. Apply severity colors consistently; don't set every buffer-led state to error. Keep both metrics visible. Use semantic primitives and no category-independent legacy color scale.
4. Preserve range/directional distance; canonical borrowed-per-collateral quote. At exact endpoints In range, tiny nonzero distance sign remains clear. Range cannot require undefined market-wide liquidity.
5. Show composition percentages and tooltip token quantities/value calculations. Fraction labels sum to 100 at display precision. Zero total composition is unavailable, not 100% cash by default.
6. Complete exact tooltips below. Add explicit missing input and freshness explanations. Plain Unavailable should be distinguishable from Not applicable; don't rely on generic dashes everywhere.
7. Remove range-liquidity query until defined; share chart query only if independently justified later.

Rewrite-ready tooltip essentials:

| Metric | Required explanatory copy/formula |
|---|---|
| Health | Proximity to start of Liquidation range; remains 1.00 at/below upper edge; monitor buffer thereafter. `max(Oracle price / Upper boundary, 1)` |
| Buffer | Debt-relative liquidation-adjusted margin, not price-drop allowance or withdrawable equity. `(Adjusted value − Debt) / Debt ×100`; amount `Debt × Buffer% /100`; exact verified predicate |
| Range | Conversions may occur both ways; losses need not recover with price. Lower edge isn't hard-liquidation price. Show upper/lower and bands; above `(p−u)/p×100`, below `(l−p)/p×100` |
| Collateral value | Remaining collateral and converted assets backing debt. `q×p+b`; value-share formula and both token amounts |
| Leverage | Remaining collateral exposure/equity; amplifies relative-price gains/losses and potential collateral yield, less borrowing costs. `q×p/(q×p+b−d)` |
| ROE | Current composition and rates, APR without assumed reinvestment; excludes price movement and conversion P&L. `(Annual asset yield + eligible rewards − gross borrowing costs)/equity×100` |
| Yield multiplier | `ROE APR / unleveraged collateral APR`; show reference APR and included yield sources; not exposure leverage |
| Status | Actual resolved status, category, triggering raw comparison, provisional thresholds, data age/verification gap where applicable |
| Debt | Current Controller debt including accrued interest, token and snapshot time |

Exit: no contradictory alerts, complete formulas, actual buffer priority and stable unavailable/stale behavior in responsive stories.

## Phase 5 — Complete offline and live review modes

Rebuild `BorrowPositionDetails.stories.tsx` and affected health stories around shared view model/fixtures. Cover all original matrix cases and category thresholds; all required rate/history/address/provenance fixtures supplied. No accidental real RPC/USD fetches from offline stories.

Small prototype-only review controls should let coworkers select a fixture or public viewed address and copy a link. Put scenario category/threshold settings and provenance in an inspectable panel, not console-only logs. Keep sample data explicitly labeled. Read-only address identity must not replace signer identity inside mutations or allowance checks. Disable submit/sign in sample/viewed-address mode. Existing wallet-connected flow remains a distinct mode.

Add a visible prototype note: "Experimental position metrics. Warning thresholds are provisional." Where action data is simulated: "Preview only — no transaction will be submitted." Do not claim data is live when fixture-backed.

Exit: fresh browser without wallet reaches a deterministic card plus linked forms/list/table examples; actual connected users can inspect their own real positions with fresh provenance.

## Phase 6 — Extend the agreed metrics to ALL requested surfaces

Do this as an explicit phase after shared-model fixes. Do not copy the current monolithic BetaBorrowInformation into each surface. Keep one prototype feature flag across all migrated surfaces so a coworker cannot accidentally mix new card with old forms.

### 6A. Action form fields and explanatory copy

Audit all create/borrow/manage/repay/reset/close flows, leverage-enabled and ordinary variants. Preserve transaction amounts, route selection, approval, minimum receive, slippage, fee/gas and action availability mechanics.

Files/entrypoints:
- `features/borrow/components/LeverageInput.tsx` and borrow/create form components.
- `features/manage-loan/components/RepayForm.tsx` (currently Increase Health CTA).
- `features/manage-liquidation/ui/alerts/AlertRepayDebtToIncreaseHealth.tsx`.
- `features/manage-liquidation/ui/tabs/ImproveHealthForm.tsx` and tab configuration/import callers.
- `widgets/action-card/hooks/useBorrowRates.ts`, `usePrevLoanState.ts`, `getLeverageInfoFields.ts`.

Specific rule: an in-range repay can increase buffer while new Health remains 1.00. Replace presentation text "Increase Health" with **Increase buffer** and explanation "Repay debt to increase your Liquidation buffer. This does not necessarily move your position out of the Liquidation range." Primary plain repay buttons can remain Repay. Preserve function/internal names when renaming isn't useful; don't change validator behavior just to match UI terminology.

The leverage slider/control may represent a route/input multiplier rather than post-action directional leverage. Do NOT feed new L into an SDK setter expecting its old multiplier. Keep the established input semantics, explain them (e.g. leverage target), and show resulting **Estimated position leverage** computed from the projected composition. Trace exact units before changing any validation or max constraints. If Health control/threshold is actually Controller health, keep it in protocol units internally and relabel its display to buffer where correct; never use clamped Health to decide whether an action is safe/allowed.

### 6B. Shared actionInfos current → estimated result

Main file `widgets/action-card/LoanActionInfoList.tsx`. Replace ambiguous scalar health/prevHealth props for prototype path with current and projected metric models. Current model is the same snapshot as card. Projected model comes from action-specific SDK/contract previews with provenance and completeness; don't use current prices/range when the action changes them.

Display current → estimated for Health, buffer % and amount, full range and directional distance, Collateral value/composition, debt, history-qualified exposure leverage, ROE APR and multiplier where applicable. Layout can use compact grouped rows; do not remove fee/gas/return-to-wallet details. Tooltips and status colors share card semantics. Projected status is explicitly Estimated, never a statement the action already occurred.

When an action closes the loan, projected state is **Position closed**. Debt becomes 0; Health/buffer/range/leverage/ROE are not applicable, not infinity, 1.00 or manufactured 0% buffer. Closing proceeds remain in return-to-wallet rows, not as collateral still securing debt.

Projection wiring matrix:

| Flow | Existing files/data | Required adaptation |
|---|---|---|
| Create ordinary/leveraged | `features/borrow/components/CreateLoanInfoList.tsx`; `queries/create-loan/*health`, `*prices`, `*expected-collateral` | Derive projected q from actual expected total collateral, d from expected debt, b only as guaranteed by implementation; projected range from SDK, full health from verified preview. No previous position. Current draft leverage selection qualifies projected leverage display before history exists |
| Borrow more | `BorrowMoreLoanInfoList.tsx`; `queries/borrow-more/*` | Reconcile expected collateral's total-vs-delta semantics before summing; include current AMM b; projected debt/range/full health from the same action inputs/route. Don't reuse SDK futureLeverage as final new L |
| Add collateral | `features/manage-loan/components/AddCollateralInfoList.tsx`; `queries/add-collateral/*` | Project q/d/b under exact action behavior, updated range/full-health preview; unchanged rates can reuse current rates only with explicit provenance |
| Remove collateral | `RemoveCollateralInfoList.tsx`; `queries/remove-collateral/*` | Same normalization; preserve balance/min-debt constraints; reduce secured collateral, not historical user deposits |
| Repay ordinary | `features/borrow/components/RepayLoanInfoList.tsx`; `queries/repay/*` | Distinguish wallet repayment from AMM-held borrowed tokens; projected debt and balances from exact repay semantics; use full preview health separately from non-full |
| Repay with collateral / deleverage | same repay files plus expected-borrowed/route helpers | Use quote/simulation for collateral consumed, borrowed received/used and residual holdings; account for existing b once; don't extrapolate collateral/debt from old leverage scalar |
| Reset/reposition | `features/manage-liquidation/ui/ResetPositionInfoList.tsx`; `queries/reset/*` | Normalize post-action q/b/d/range and full health. Current `collateral={prevCollateral}` and debt delta alone are not sufficient proof of complete projected composition |
| Full repay/close | `ClosePositionInfoList.tsx`, close-loan queries, repay `isFull` | Explicit closed model; preserve expected proceeds, costs, approvals; never show future infinite health |

For every route branch (V0, unleveraged, zapV2 etc.), verify preview health mode and percentage scaling from locked SDK. `createLoanExpectedMetrics.health` cannot be assumed equivalent without tracing it. Existing `useHealthQueries` deliberately combines full/non-full; expose full results for new buffer without altering legacy/transaction consumers. Health factor comes from oracle / FUTURE upper boundary, not preview Controller health.

If an SDK preview lacks post-action holdings, add the smallest verified quote/simulation adapter. Until then show **Estimate unavailable** for affected derived metrics with missing-field reason; keep independent debt/range results. Never silently show before-state ROE as after-state. Stale quote or rapid input edits must cancel/ignore mismatched responses. Don't fill b=0 just because the old actionInfo omitted it.

Future yield rates use expected borrow APR where available; collateral-only actions may reuse current rate under an explicit unchanged-rate assumption. No fallback to current rates while a required future rate is loading/failed. Approved reward eligibility may change after action; do not preserve old reward amounts blindly.

`getLeverageInfoFields` currently derives "leverage collateral" from its historic multiplier. Keep route-financing breakdown quantities separate from directional leverage; do not substitute new L into `calculateLeverageCollateral`. Explicitly label and source any leveraged collateral/total collateral breakdown.

### 6C. Market list — generic market metrics

Files: `features/market-list/columns/{column.definitions.tsx,column.titles.ts,columns.enum.ts,column.options.tsx}`, `cells/MaxReturnOnEquityCell.tsx`, `widgets/tooltips/MaxReturnOnEquityTooltipContent.tsx`, `rates.utils.ts`, `features/market-advanced-information/hooks/useAdvancedDetailsData.ts`, `MarketLoanParameters.tsx`, sorting/filter UI.

A market without a selected position does NOT have position Health/buffer/leverage/ROE. Keep market leverage limit separate from current directional leverage. For the existing **Max RoE** column, preserve its maximum-leverage scenario meaning, but change rate basis to APR and label clearly **ROE at max leverage** (or compact Max ROE with this meaning in tooltip). It is not necessarily the mathematical maximum ROE when borrow cost exceeds yield.

For the idealized zero-conversion starting scenario with equity normalized to 1: c=M, b=0, d=M−1. Use the same APR helper with gross borrow APR and eligible collateral/reference yield; explicitly state scenario assumptions and exclusion of swap costs/price movement. Verify SDK/API M describes the assumed leverage limit; if route slippage changes actual exposure, label theoretical and actual preview differs. Do not compute a market 'status' from that scenario as though it were a live position.

Show only for collateral yield capability; unavailable stays distinct from no-yield. Add reference APR/yield multiplier where the cell layout supports it, at minimum tooltip. Update advanced parameter display to the same APR calculation. Numeric sorting/filtering use raw new APR, never old APY or formatted strings. Preserve `maxRoe` persisted ID where semantics remain same scenario; version persisted numeric filters if interpretation changes. Supplier APY/gauge income stays supplier APY, not indiscriminately converted.

### 6D. Your Positions table and summary

Files: `queries/market-list/llama-market-stats.ts`, `features/market-list/user-position.utils.ts`, `cells/HealthCell.tsx`, column definitions/options/titles/sort options, responsive row/expanded renderers and Your Positions section.

Preserve FULL health, oracle, explicit user range, balances, debt and timestamps in the normalization boundary. Current normalized `health` loses the distinction through `getDisplayHealth`; do not reuse it as new factor or verified buffer. Existing stats provide tick indices, not necessarily the exact current range prices; source current boundaries from a verified batch or a documented API field. Do not derive new H from `healthFull-health` or sqrt-price heuristics. Avoid per-cell hooks: enrich rows at existing `useLlamaMarketRows` query boundary, batch per chain, deduplicate shared market oracle data, fetch only owned/visible positions as appropriate.

Add stable columns/accessors for **Health** (ratio), **Liquidation buffer** (% plus amount/tooltip), **Status**, and range/distance. Show position Collateral value/debt consistently; leverage/ROE may be optional columns or expanded details to preserve density, but must be accessible. Do not swap column meanings row-by-row when buffer leads: only card/expanded-detail priority may change. Sort Health by H, buffer by signed raw margin, status by documented severity. H ties at 1 must not obscure available buffer; use explicit secondary sort or let user sort buffer. Never mix ratio and percentage in one numeric accessor.

Migrate the persisted old `userHealth` percentage column/filter state intentionally; either new ID or explicit version migration. Test restored saved views so an old percentage filter doesn't filter new H incorrectly. Update column chooser, sort menu, mobile cards/expanded rows and default position view together.

Collateral USD totals should either use the same oracle-derived collateral value × borrowed USD rate as card, or be clearly separated as an independently priced market-value measure. Do not show two different calculations under an identical label without explanation. Aggregate unavailable positions as a partial total with coverage, not silently zero (existing `aggregate` currently does this); never sum/average Health factors, leverage or ROE across positions as a portfolio metric.

### 6E. Market borrowers / user position table

Include this surface as well as Your Positions because both can be understood as the requested user position table. Files: `features/market-participants/{market-participants.columns.tsx,market-participants.utils.tsx,MarketParticipantsCards.tsx}`, `queries/market/market-participants.query.ts`, `packages/prices-api/src/llamalend/schema.ts::marketBorrower`.

Current borrower payload has address/debt/collateral/health/soft_liquidation but lacks explicit full health, oracle/user boundary data and converted borrowed balance. It is insufficient for the new model. Trace backend meaning of `health`; do not relabel unknown health as buffer or manufacture a ratio. Extend typed API coverage if verified endpoint data exists; otherwise use bounded, paginated chain reads for visible borrowers via the shared snapshot adapter. Same onchain identity/provenance for a row and its expanded details. No thousands-of-borrowers waterfall or full-history request for every collapsed row.

Replace old percentage Health on desktop, mobile and expanded panels. Show new ratio, buffer and contextual status when inputs are available. Render source-specific unavailable state where they are not. Collateral composition/ROE/qualified leverage can load on expansion to bound data costs, using exactly the same helpers. Make row click/view action open the read-only viewed position.

Do not alter supplier rows, supply APY or gauge balances as part of this borrower metric migration. Do not change event-history historical metrics into today's computed values; historical rows retain their timestamped meaning.

### 6F. Charts, alerts and residual copy

Inspect `widgets/small-liquidation-range-chart/SmallLiquidationRangeChart.tsx`, full price/band charts, `widgets/ChartAndActivityLayout.tsx`, the market advanced oracle explanation, and any Health/LT labels in their tooltips. Preserve raw chart price data and transaction logic. Boundary labels must agree with upper/lower conversion range, not hard-liquidation price. Before/after chart ranges must match the projected action model.

Search all Llamalend render code for legacy claims ('Health reaches 0', 'Increase Health', 'Liquidation Protection active', '% distance to LT', APY ROE). Categorize each occurrence: migrate prototype presentation; retain protocol internals; retain flag-off path; retain explicitly historical fields. Deliver the search audit, not a blind replacement.

Exit for phase 6: same current snapshot produces matching card/form/table values; same preview produces matching action metrics/chart; no APY-based ROE under the new APR label; no old health percentages presented as new Health anywhere in enabled prototype borrower surfaces.

## Phase 7 — Regression tests that prove integration

Add these beyond the original numeric examples:

| Test | Required assertion |
|---|---|
| full positive/non-full negative | no Liquidatable badge or old liquidation alert in prototype |
| exact h=0 / ±epsilon | zero critical, negative eligible on verified strict predicate; displayed sign preserved |
| failed discounts read | full buffer still available |
| invalid bounds/oracle | unavailable, no plausible H or In range |
| independent stale rate | card risk current, ROE marked stale |
| above/inside/below/fully converted | lead order correct desktop AND mobile; severity-consistent colors |
| no-yield / unknown feed / zero yield | hidden / unavailable / valid zero distinguished |
| fully converted with missing collateral rate | calculate known cost if no collateral income input needed; multiplier omitted if reference unavailable |
| borrowed asset yields | numerator includes only verified applicable income; no hardcoded zero |
| eligible separate rewards | included once, reference includes same assumptions, unknown required rewards not zero |
| mint/lend leverage episodes | current episode only; same-timestamp ambiguity unknown; incomplete history not no |
| partial repay inside range | Health remains 1 but buffer improves, CTA/copy says buffer |
| leveraged create draft | projected L visible even before history, matches projected q/e |
| deleverage | quote-derived residual q/b/d consistent; wallet funds not double-counted |
| full repay/close | Position closed, no infinity/1.00/buffer ratio |
| rapid form edit/route switch | no stale projected values from previous draft |
| flag off | legacy behavior stays coherent, extra prototype queries not unnecessarily active |
| table parity | fixed block card = form before = Your Positions = borrower detail |
| table sort/persisted views | sort raw metric; unknown last; old percentage filters migrated |
| read-only address mode | no mutation uses viewed account as signer; submit disabled |
| fresh coworker browser | no wallet required for offline/review examples; formulas and controls accessible |

Original arithmetic cases remain required: H=1.2/drop=16.6667%; below p70/l80/rise14.2857%; c300/d200/e100/L3 and ROE5% at 3/2 APR; mixed c180/b90/d200/e70/L2.5714/ROE2%; fully converted b210/d200/e10/ROE−40%; debt20k×3.27%=654. Assert result discriminants before reading values so unavailable cannot pass silently.

Use fixture-based component tests for all new data dependencies, not the old incomplete stories. Add at least one receipt/source-verified read-only live fixture per supported category and lend/mint/version family being claimed. Pin block for parity tests; rate as-of remains separate. No mainnet transactions required. If live evidence unavailable, accurately mark that case not verified and keep its UI fallback; do not call it passed.

## Phase 8 — Coworker handoff and completion gate

Deliver a checked-in `.prototype/README.md` with:
1. exact install/runtime and start commands, port and explicit prototype enablement;
2. clean-browser entry URL and scenario menu/direct links;
3. public viewed-address instructions, network/market selection and copy link;
4. scenario catalog: each category, ordinary/leveraged, in/below range, recovery, liquidatable, missing/stale, close/reopen;
5. action walkthrough covering all seven action families in fixture/read-only preview mode;
6. market list/Your Positions/borrowers table walkthrough and expected parity;
7. provisional threshold/category config location and meanings;
8. source/provenance and known unsupported cases;
9. test/check commands with actual results; screenshots desktop/mobile and Light/Dark/Chad;
10. no-wallet/no-signing instructions for reviewers, and a note that live rates/blocks change results.

Build shared preview artifacts only when requested/authorized; a local server isn't a coworker-accessible URL. Provide a runnable branch/runbook now, and describe the exact deployment artifact ready to publish rather than silently exposing the machine. Never tell coworkers a URL is accessible without verifying it from the intended environment.

Complete means: F01–F16 resolved or explicitly unsupported with a visible correct fallback; type/lint and discovered tests pass for changed scope; no untracked required source files omitted from deliverable; deterministic stories cover every agreed state; all requested surfaces use the same metrics; no wallet/signature needed for review mode; view/signer separation tested; actual screenshot review completed; no claim of protocol verification unsupported by evidence.

## Residual factual/product inputs

- Blue-chip/Long-tail controller assignments need maintained explicit decisions; current choices may be provisional but cannot be attributed to PR #3285.
- Warning thresholds remain deliberately provisional; disclose and make tunable rather than claiming calibration.
- Deployed implementation matching, complete current-loan event coverage, unusual yield-bearing borrowed-token accounting and future LP borrower rewards remain evidence tasks.
- Historical API fields must be verified before migration; a field named health does not establish full-health meaning.

Cursor should complete independent implementation and fixtures while resolving these, then report concrete unsupported cases. Do not use them as a reason to stop after cosmetic card changes, and do not invent financial facts to mark the checklist done.
