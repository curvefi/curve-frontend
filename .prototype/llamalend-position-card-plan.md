# Llamalend position card: Cursor prototype implementation plan

Prepared 24 September 2026. This is a design specification and implementation handoff, not an implementation. No production files were changed for this handoff.

## 1. Objective and authority

Build a real-data prototype of the redesigned borrower position card, starting from current `main`. Preserve the agreed future mental model rather than historical frontend or documentation terminology:

1. Health: proximity to entering Liquidation Protection.
2. Liquidation range: where conversions can occur, with directional price distance.
3. Liquidation buffer: debt-relative margin before hard-liquidation eligibility.
4. Collateral composition and economics: what assets and exposure remain.

Contracts establish mechanics; product decisions establish presentation. Do not copy historical health logic simply because it exists. Do not alter protocol writes or transaction eligibility as part of this prototype.

Design references:
- Card: https://www.figma.com/design/WqKZs1KfrupheOs5PXU3D6/00_Curve_LLamalend?node-id=21381-592057
- Tooltips: https://www.figma.com/design/WqKZs1KfrupheOs5PXU3D6/00_Curve_LLamalend?node-id=21381-594253
- Inspected Figma version: `2402814226791759589`. Eight card frames: desktop/mobile healthy, near range, protection, liquidation. These are layout references; their placeholder numbers are not fixtures.
- Read exact nodes and rendered images through `/Users/ndrik/Documents/Projects/Crypto/Curve/Curve Design/tools/figma_api.py`. No Figma edits are authorized.

## 2. Branch and dependency handling

Saved project: `/Users/ndrik/Documents/Projects/Crypto/Curve/curve-frontend`.

Before implementing, read applicable AGENTS guidance and inspect status. Fetch origin, then create `codex/llamalend-position-card-prototype` from freshly fetched `origin/main` in an isolated worktree if the existing checkout owns other work. Never reset, stash, or carry unrelated changes implicitly. Do not publish, push, open a PR, or merge external work without direction. This handoff authorizes local prototype work only.

Reference checkout inspected at `e2dafa070251ea57f4c84f7c1fcce510c04aff03`; re-resolve paths on main. The checkout was on `username/sync-text-colors`. It had unrelated edits earlier in the discussion and was clean at the last inspection; do not assume either state persists.

Classification dependency: https://github.com/curvefi/curve-frontend/pull/3285, inspected head `ae79a508c26aa0b2fc4c2377c366bb8d46ea5775`, OPEN at final check. Recheck at implementation time. Reuse its chain-and-Controller mapping and `getMarketAssetsType` access pattern. Do not create a second market registry. If not merged, keep any minimum compatible dependency change isolated and document it rather than silently merging the whole branch.

The user's exact categories are **Correlated**, **Blue-chip**, **Long-tail**. No additional category or automatic precedence scheme. Assign markets explicitly. The PR currently provides only stable/volatile; volatile entries cannot be split automatically. Missing assignment is missing metadata, not a fourth category. Retain a neutral status where a category-dependent judgment cannot be made; contract liquidation warnings still work.

The PR also uses classification for leverage slippage. Extending categories must preserve established slippage behavior (Correlated maps to the prior stable behavior; both other categories preserve prior volatile behavior), with a focused regression check. Do not change slippage policy incidentally.

## 3. Evidence and verification boundary

### Confirmed integration facts

- Locked/installed `@curvefi/llamalend-api` is 2.5.2 in the inspected checkout; verify main's lock before coding.
- SDK lend `userPosition.userHealth(full, address)` calls Controller `health(address, full)`, multiplies by 100, then formats 18 decimals. Returned strings are percentage points, not raw WAD or fractions.
- SDK `userState` calls `user_state`, normalizing collateral by collateral decimals and borrowed/debt by borrowed-token decimals. Frontend currently renames lend `borrowed` to `stablecoin`; this does NOT imply the token is always a stablecoin.
- SDK lend `userPrices` calls `user_prices`, formats 18 decimals, and reverses the contract tuple. Contract order is upper/lower; SDK order is lower/upper. Use named fields after decoding, not anonymous tuple assumptions throughout the UI.
- SDK lend `oraclePrice()` reads `AMM.price_oracle()` and caches for 60 seconds; user state has a 10-second SDK cache. Existing independent queries are not a coherent block snapshot.
- SDK `currentLeverage()` divides remaining collateral quantity by historical user deposits. It is not the agreed exposure/equity formula and must not supply the new value or history flag.
- Maintained `packages/prices-api/src/lending/schema.ts` and `crvusd/schema.ts` expose leverage metadata and `is_position_closed` on collateral events. Their presentation hook drops this metadata. Lending response transforms also discard count/page/pagination; completeness is not currently established by that hook.

### Contract-source result, not a claim about every deployment

Curve source inspected at commit `dc7f6c9546779527290c5af30d27e421acf17afd`:
- https://github.com/curvefi/curve-stablecoin/blob/dc7f6c9546779527290c5af30d27e421acf17afd/curve_stablecoin/controller.vy
- https://github.com/curvefi/curve-stablecoin/blob/dc7f6c9546779527290c5af30d27e421acf17afd/curve_stablecoin/ControllerView.vy
- https://github.com/curvefi/curve-stablecoin/blob/dc7f6c9546779527290c5af30d27e421acf17afd/curve_stablecoin/amm.vy

`controller.vy::_health` starts with discounted `get_x_down / debt - 1`; full health conditionally adds above-band collateral value. `liquidate` computes full health with the user's liquidation discount and requires **health < 0** for a caller without user approval. Self/approved liquidation is a different permission path and must not make a healthy position appear publicly liquidatable. Exact zero does not satisfy this strict predicate.

`ControllerView.user_prices` returns `p_oracle_up(n1)` and `p_oracle_down(n2)`. `user_state` returns current AMM balances and accrued debt. AMM base price uses the rate multiplier, so boundaries can move with interest without a price change.

The repository includes deployment records for Optimism wstETH/WETH Controller `0x745422BF49f3F6e4A8E12E4abD19339E7910F8C9`, but a current source checkout plus deployment record does not prove matching deployed bytecode. Explorer source inspection was unavailable (403/inaccessible). No same-block RPC position checks were completed in this research.

**Implementation gate:** for each market/version used in live validation, record chain, Controller/AMM, implementation identity, matching verified source/revision, exact health predicate, decimals, and block. Cover lend v1, lend v2, and mint versions if included. Never universalize the source above without matching. Unsupported/unverified variants may render independent data but must not claim verified Healthy/Liquidatable status.

### API yield evidence

Read through shared `curve_api.py`, retrieved 2026-09-24 15:33:52 UTC, source cache 15:32:36 UTC:
https://prices.curve.finance/v1/lending/markets/ethereum?page=1&per_page=100

Ethereum wstETH-long2 Controller `0x5756A035F276a8095A922931F224F4ed06149608`, version 1:
- collateral `rebasing_yield_apr`: 2.2485992820575618 (% APR).
- collateral `rebasing_yield`: 2.274 (% APY).
- `borrow_apr`: 2.4312784277952004 (% APR).
- `borrow_total_apr`: 0.18267914573763866; already subtracts collateral yield, do not use as gross debt cost.
- borrowed crvUSD yield fields: null. Null is not generic proof of zero yield.
- `lend_apr_crv_0_boost` / `lend_apr_crv_max_boost`: 1.44 / 3.61; lender rewards, not borrower collateral rewards.

Rates are observations, not durable constants. Existing typed schemas preserve these APR percentage values. Normalize percentage points to decimal fractions exactly once for arithmetic. Current card ROE helper uses APYs; do not reuse unchanged.

Future LP borrower rewards need proof of entitlement, reward basis, and boost/wrapper treatment. No verified borrower LP reward feed was established. Do not import a pool/gauge headline APR or lender rewards as borrower income.

## 4. Shared calculation inputs and data ownership

Use one derived view model with independently available metric groups. Keep reads outside components. Use existing decimal/BigNumber helpers; raw integer/decimal sign and comparisons determine state, never formatted numbers.

Canonical notation, all values in borrowed-token units unless stated:
- `q`: remaining collateral token quantity; `b`: borrowed-token quantity held in AMM.
- `d`: current outstanding debt; `p`: oracle borrowed tokens per collateral token.
- `u`, `l`: upper/lower oracle-price boundaries, with `u >= l > 0`.
- `c = q*p`; `a = c+b` (displayed Collateral value); `e = a-d` (equity).
- `h`: full Controller health returned by SDK in percentage points.
- `eligible`: exact third-party liquidation predicate for verified implementation.

For live accounting, use a single block-tagged read batch for state, full health, oracle and user prices via the nearest existing SDK/provider multicall facility. Preserve query ownership/invalidation. If current SDK methods cannot accept a block tag or bypass their caches, add the smallest typed read adapter at the query layer; do not pretend Promise.all of cached methods is atomic. Record block number/time. Separate API rate/history timestamps remain explicit.

Do risk calculations only in canonical quote direction. If displaying inverse price, invert AND reorder endpoints and clearly label units; do not apply the canonical rising/falling distance formula to an inverse display. Prefer canonical quote direction for the prototype. Validate six- and eighteen-decimal borrowed tokens.

Interest refresh invalidates debt, health, boundaries, equity, distances and rates as appropriate. Reuse existing action invalidation, add new query keys to `queries/user/invalidation.ts`. Reject a closed/missing loan before division; do not manufacture zero-health metrics for it.

## 5. Metric specification and tooltip copy

Every calculated metric includes its formula directly in a keyboard/touch-accessible tooltip, using the existing tooltip primitives. Direct contract values explain their source rather than invent a formula. Optional numeric substitution aids prototype debugging. Formula inputs share the displayed snapshot. Existing semantic tokens and metric formatting are preferred.

### Health

`H = max(p/u, 1)`; dimensionless, normally two decimals. Any raw `H > 1` must never render exactly 1.00: use added precision or `>1.00`. At/below `u`, display 1.00. This is the new product definition, not Controller health. Do not expose internal full/non-full names to users.

Tooltip: "Shows how close the oracle price is to the start of your Liquidation range. Health stays at 1.00 once price reaches or falls below that boundary. Monitor Liquidation buffer for hard-liquidation risk. Calculated as: Health = max(Oracle price / Top of liquidation range, 1)."

Health leads above range unless a critical buffer or eligibility warning needs priority. Buffer leads inside and below range. Keep both visible; use the same order on desktop/mobile.

### Liquidation range and distance

Display the full upper-to-lower range with unambiguous borrowed-token-per-collateral-token units. Never call its lower boundary the hard-liquidation price.
- Above (`p>u`): `(p-u)/p*100`, "X% price drop to range".
- Inside (`l<=p<=u`): "In range".
- Below (`p<l`): `(l-p)/p*100`, "X% price rise to range".
- Tiny nonzero distances must not appear to be an exact boundary.

Tooltip: "The oracle-price range where LLAMMA can convert between your collateral and the borrowed asset. Conversions can cause losses in either direction; price recovery does not guarantee recovery of those losses. The lower boundary is not a hard-liquidation price. Monitor Liquidation buffer for that risk."

Include the applicable distance equation, upper/lower prices, band indices, inclusive band count. Below-range addition: "A price rise back into the range can trigger further conversions and losses, reducing your Liquidation buffer." Do not imply zero conversion risk outside range when collateral remains or that interest risk pauses below range. Omit Figma's "total range liquidity" until its precise meaning/source is defined; do not fabricate it.

### Liquidation buffer

For a verified matching implementation use `h` directly as buffer percentage, not `h/(loanDiscount-liquidationDiscount)` and not a full/non-full minimum. `bufferAmount=d*h/100`. Equivalent liquidation-adjusted value is `d*(1+h/100)` for explanation, subject to contract integer rounding; do not independently reconstruct contract health from spot collateral value.

Show percent with borrowed-token amount beneath it. Retain sign. Tiny positive: `<0.01%`; tiny negative: e.g. `−<0.01%`; exact zero: `0.00%`. Apply analogous sign-preserving formatting to the amount. Eligibility uses raw health. For strict `<0` implementations, zero is boundary/critical, not Liquidatable. Never truncate a negative buffer to zero.

Tooltip: "Shows how much liquidation-adjusted value remains above your debt. A 5% buffer means your liquidation-adjusted position value equals 105% of your debt. This is not a 5% allowance for a price drop. Liquidation-adjusted value is the value the protocol uses to assess hard-liquidation eligibility."

Equations: `Buffer % = (Liquidation-adjusted value − Debt) / Debt × 100`; `Buffer amount = Debt × Buffer % / 100`. Add exact threshold sentence for the verified predicate (e.g. "Below 0%, the position is eligible for hard liquidation").

### Collateral value and composition

`a=q*p+b`. Retain the agreed label **Collateral value**. Main amount in borrowed token, optional USD conversion using its USD rate. Do not count externally withdrawn borrowed tokens as assets securing this position.

Bar: original collateral share `100*c/a`; borrowed-asset share `100*b/a`. These are CURRENT VALUE shares, not historic percentage converted. Derive complementary rounded labels so their sum is 100%; maintain accurate underlying decimals. At `a<=0`, show unavailable/empty composition. Actual token quantities in tooltip. Use text labels as well as color.

Tooltip: "Current value of the assets securing your debt, including remaining collateral and borrowed assets held after LLAMMA conversions. Calculated as: Collateral value = Remaining collateral × Oracle price + Converted borrowed asset. Composition % = Asset value / Collateral value × 100."

### Total debt

Use current Controller/user_state debt, normalized by borrowed decimals. Show borrowed token and optional USD notional. Tooltip: "Total amount currently owed, including accrued borrowing interest. Read from the Controller at the displayed update time." Do not recompute from transaction history.

### Leverage and eligibility

`L=c/e` for `e>0`. Show ONLY with verified leverage management in the CURRENT loan episode. Keep visible thereafter, including `0×` when `q=0` and `e>0`. At `e<=0`, unavailable; never negative leverage or infinity. Small positive equity can produce large finite leverage: preserve it with sensible precision, no silent cap.

Use raw lending/crvUSD collateral-event queries, not `originalLeverage`/SDK currentLeverage heuristics. Derive a tri-state eligibility flag: yes/no/unknown. Establish chronological ordering and completeness, identify last loan closure/current opening, and inspect supported leverage-event types in that episode. Any historic loan before the current episode must not qualify it. Partial liquidation is not automatically closure. Do not assume null metadata proves ordinary borrowing when API coverage is unknown. Preserve pagination metadata and fetch additional history only using verified endpoint support. If completeness/order/current-episode identity cannot be established, mark eligibility unknown and hide the metric with a prototype diagnostic explaining why. Do not fabricate history. Verify one real supported leverage transaction against its receipt; record coverage limitations for routes/versions.

Tooltip: "Your remaining collateral exposure relative to your equity. Leverage amplifies gains and losses from relative price changes. For yield-bearing collateral, it can also amplify yield on your equity, while borrowing costs reduce the net return."

Equations: `Leverage = Remaining collateral value / Equity`; `Equity = Collateral value − Total debt`. Explain that collateral value includes both assets.

### Return on equity (ROE)

Show for markets with an eligible collateral yield source (intrinsic yield or verified collateral rewards), independent of market category and leverage-history visibility. Keep displayed through conversion, including fully converted positions. Missing required inputs or `e<=0`: Unavailable, not zero. Known yield-bearing eligibility persists when current yield is zero/negative or temporarily unavailable; don't use `APR>0` alone as capability metadata.

APR basis throughout. Let `rc`, `rb`, `rd` be decimal APR fractions for intrinsic collateral yield, applicable income on borrowed assets in the position, and GROSS borrowing cost. Let `R` be eligible separate annual rewards in borrowed-token value. Then:

`ROE fraction = (c*rc + b*rb − d*rd + R)/e`; display `100*ROE fraction % APR`.

Use `rebasing_yield_apr`, `borrow_apr`; never mix APY, never use net `borrow_total_apr`, never use lender yield on unstaked borrowed assets held in LLAMMA. Intrinsic wrapper appreciation/rebasing must be accounted once. Null yield means unknown unless the token's no-yield behavior is independently established. If an asset balance is exactly zero, its yield input is unnecessary. If borrowed asset itself yields, verify debt denomination/rebasing and quote-currency treatment before enabling that pair; don't count the same relative appreciation twice.

Separate future rewards need recipient eligibility, earning balance, annual rate/amount, boost, token price and inclusion/exclusion from intrinsic yield. Do not promise future LP markets are supported until those inputs and contract behavior exist. Keep implementation proportional: a typed optional verified reward input, not a new rewards platform.

Tooltip: "Estimated annual return on your current equity from collateral yield and eligible rewards, after borrowing costs. Expressed as APR, without assumed reinvestment. Uses current balances and estimated rates. Excludes market-price movements and LLAMMA conversion gains or losses."

Equation: `ROE % = (Annual asset yield + Annual rewards − Annual borrowing costs) / Equity × 100`. Show expanded input rates/amounts in the prototype tooltip.

### Net yield multiplier (ROE secondary line)

Replace the meaningless USD notional for this rate with `ROE APR / unleveraged collateral yield APR`, e.g. **2.63× collateral yield**. Same eligible yield sources and boost/reward assumptions in numerator and reference. Tooltip identifies reference APR and says this is a yield comparison, not exposure leverage.
- Positive reference and positive ROE: show ratio, including <1×.
- Positive reference and exact zero ROE: show 0× (boundary extension of the agreed rule).
- Negative ROE: "Net yield negative".
- Zero/negative/missing reference: omit multiplier.
- Missing ROE: no calculated secondary value.
- Continue during conversion. Fully converted positions may still have a known reference asset APR; if position-specific reward assumptions make reference unavailable, omit multiplier.

## 6. Status, thresholds, colors, freshness

One status/severity resolver feeds text and colors. Preserve location and composition as independent fields even when a warning overrides the label.

Priority:
1. Verified exact liquidation predicate -> **Liquidatable**, strongest warning, buffer first.
2. Critical buffer threshold (includes exact zero for strict-negative eligibility) -> **Critical buffer**, buffer first.
3. Low buffer threshold -> **Low buffer**.
4. Below range with no remaining collateral -> **Fully converted**.
5. Below range with collateral remaining -> **Partially converted**.
6. Inside range -> **Liquidation Protection** (never "active").
7. Above range within category-specific proximity threshold -> **Near range**.
8. Above range with adequate distance AND buffer -> **Healthy**.

No momentum inference. Do not say Approaching or Recovering merely because of location. Do not call a live eligible position Liquidated.

Thresholds are explicitly provisional and centrally configurable for exactly Correlated/Blue-chip/Long-tail. Separate price-distance thresholds from buffer thresholds. For initial fixture testing only, use category-differentiated proximity values and document them as arbitrary test settings; do not present them as calibrated real-world thresholds. Before live review, set provisional values with a visible prototype annotation/config and record rationale. Do not reuse legacy thresholds 2.5/15/40/50 without reevaluation: they describe different metrics. If no thresholds are configured, render factual location rather than an unsupported Healthy judgment. Threshold changes must immediately affect both labels and colors. Tooltip shows category, comparison and threshold.

Initial loading: skeletons. Missing required input: affected metric unavailable, independent metrics visible. No verified safety inputs -> no reassuring overall Healthy status. Failed refresh: retain last-known snapshot with "Update failed" and last update time/block; don't depict it as fresh. Use applicable existing stale/cache policy and expose age rather than invent a protocol freshness guarantee. Critical/eligible last-known warnings remain visible but marked stale. Rate/history failure must not erase fresh risk metrics. Provide retry via existing query pattern. Tests must include chain/account changes to avoid retaining another position's values.

## 7. Implementation sequence and file map

1. Establish branch/dependencies and evidence record described above. Use current main's nearest maintained patterns. Keep prototype behind the existing `useNewLlamalendHealth` flag if still available; do not globally flip default production behavior.
2. Implement small pure calculations and status/formatting helpers next to `features/market-position-details`. Proposed `position-metrics.utils.ts`, `position-status.utils.ts` and a local typed view model; reuse existing decimal helpers. No new state store.
3. Add/cohere the snapshot query at the existing user query layer; reuse addresses, SDK/provider/ABI and root keys. Existing paths: `queries/user/user-state.query.ts`, `user-health.query.ts`, `user-prices.query.ts`, `queries/market/market-oracle-price.query.ts`, `queries/market/market.query-helpers.ts`, `queries/user/invalidation.ts`. Keep legacy public health query behavior for other consumers; introduce a dedicated new-card derivation rather than breaking action previews.
4. Add current-loan leverage eligibility selector over maintained raw queries in `features/user-position-history/queries/user-lend-collateral-events.ts` and `user-crvusd-collateral-events.ts`. Update `packages/prices-api/src/lending/schema.ts` / `crvusd/schema.ts` only as required to preserve completeness evidence. Do not substitute the similarly named newer `llamalend` schema without tracing actual consumers.
5. Derive ROE from normalized market APR fields and snapshot composition; new helper in/near `rates.utils.ts` with distinct name so existing max-ROE table/action calculations are not silently changed. Reuse typed market data in `queries/market-list/llama-markets.ts`. Add yield-source availability metadata only where needed; leave future reward gaps explicit.
6. Compose card with `BorrowPositionDetails.tsx`, `BorrowInformation.tsx`, `health/HealthDetails.tsx`, nearby primitives and tooltip components. Existing `health/HealthAndBufferBar.tsx` / `health/utils.ts` embody earlier metrics; replace only new-card usage. Build value-composition bar, full range, buffer amount, dynamic priority, leverage and ROE secondary line. Preserve tabs, notification affordance, wallet/viewed-user context and independent data states.
7. Status hook `features/market-position-details/hooks/useUserLiquidationStatus.ts` and helpers in `llama.utils.ts` are shared with other flows. Scope new presentation status separately or explicitly audit callers. Never let this redesign change repay/borrow permissions or `useIsInLiquidation` transaction behavior incidentally. `position-status-content.ts` copy can be reused/refactored only where new semantics are appropriate.
8. Update `BorrowPositionDetails.stories.tsx` and health stories with internally consistent values and cases below. Add local/read-only viewed-wallet support ONLY if existing routing cannot preview a public position. Never require a transaction to inspect a real position; do not fabricate wallets or send funds.
9. Run targeted tests, typechecks for affected workspaces, and responsive/keyboard visual checks. Review diff for scope. Remove only new-card helpers proven unused; retain `LegacyHealthDetails`, `useLegacyUserHealthValue`, full/non-full queries used elsewhere, and other legacy behavior until a separate migration is authorized.

Figma desktop is 985px, mobile 300px. Match responsive intent, not fixed widths on all viewports. Card uses semantic bindings and existing typography/spacing components; do not infer token names solely from matching numeric values. Check small mobile width, long units, large/negative values, Light/Dark/Chad, and tooltip formula wrapping. Document intentional deviations: hierarchy swap, revised status labels, corrected arithmetic, APR and yield multiplier.

## 8. State matrix and test fixtures

Common expectations in every row: full current range visible; Collateral value `a`; composition from balances; leverage `c/e` only when history qualifies and `e>0`; ROE from composition when eligible and inputs supported. No risk state automatically hides valid economics. H below denotes the new Health, B the signed Controller buffer. Threshold-dependent labels use explicitly configured fixture thresholds.

| Scenario | Health | Buffer/status/priority | Composition/economics expectation |
|---|---|---|---|
| Far above, adequate B | p/u >1 | Healthy; H first | Ordinary formulas; drop distance |
| Near upper boundary | >1, never rounded to 1 | Near range unless buffer warning wins | Category-specific proximity; same balances |
| Exactly upper boundary | 1.00 | Protection unless buffer warning; B first | No assumption that conversions already happened |
| Partially converted inside | 1.00 | Protection; B first | Both assets, composition ROE and leverage |
| Small positive B | depends on location | Low/Critical; never Liquidatable from rounding | Show <0.01% when appropriate |
| Exact zero B, strict <0 deployment | depends on location | Critical buffer, not Liquidatable | Zero buffer amount, no automatic closure |
| Negative full health inside | 1.00 | Liquidatable; B first | Retain balances and economics where meaningful |
| Fully converted below, positive equity | 1.00 | Fully converted unless buffer warning | q=0; L=0 if eligible; ongoing costs; rise distance |
| Incomplete conversion below | 1.00 | Partially converted unless warning | q>0; exposure and yield remain; rise distance |
| Price rises through range | 1.00 | Protection/warning from current B | No recovery claim; B may worsen |
| Exited above after losses | >1 | Current distance/B resolve status | Do not restore original quantities or equity |
| Above with negative full health | >1 | Liquidatable overrides reassuring H | H remains visible, B leads |
| Non-full negative, full positive above | >1 | Not Liquidatable solely from non-full | B uses full; no legacy pessimistic substitution |
| Interest grows, oracle unchanged | may change as u changes | Refresh B, range, status | Refresh debt/equity/ROE; no frozen range |
| Ordinary borrowing | same H/B | Same risk rules | Hide L; ROE still shows if collateral yields |
| Old leverage loan closed, ordinary reopen | same H/B | Same risk rules | Old history must not show L |
| Yield collateral fully converted | 1.00 below/in range | Current B | ROE remains; may be negative; L=0 if e>0 |
| e<=0 | any | Contract B controls eligibility | L and ROE unavailable, asset/debt data remain |
| Missing/stale risk input | independent H if valid | Unknown safety/update failed | No fabricated Healthy; independent values retained |
| Correlated/Blue-chip/Long-tail | same formula | Different configured warnings | Same eligibility; ROE independent of category |

Deterministic arithmetic fixtures:
- p=120,u=100,l=80 -> H=1.20; drop=16.6667%. p=70 -> H=1; rise=14.2857%.
- H=1.004 -> never formatted 1.00. p=u and p=l -> In range; either epsilon outside yields correct direction.
- c=300,b=0,d=200 -> a=300,e=100,L=3. With rc=3%,rd=2%,R=0 -> ROE=5% APR; multiplier=1.6667×.
- c=180,b=90,d=200 -> a=270,e=70,L=2.5714; composition=66.6667/33.3333. Same rates, rb=0 -> ROE=2% APR, multiplier=0.6667×.
- c=0,b=210,d=200 -> e=10,L=0; rd=2%,rb=0 -> ROE=-40% APR; secondary "Net yield negative".
- d=20,000,h=3.27 percentage points -> amount=654 borrowed tokens.
- Full h=2 and non-full=-1 -> positive buffer; no liquidation solely from non-full.
- Test ±tiny health, exact zero, zero/missing reference yield, missing APR vs known zero, unknown history, close/reopen and partial liquidation.

## 9. Checks and real-position review

Use repository test conventions. Focused pure-math tests under the existing Vitest arrangement and card component tests under `tests/cypress/component/llamalend`. Determine exact spec paths after creation; commands: `yarn workspace @curvefi/tests test <focused-spec>`, `yarn workspace @curvefi/tests cy run --component --spec <focused-component-spec>`, `yarn workspace main typecheck`, plus affected package typechecks if their schemas/types change. Do not run unrelated full suites by default.

Component checks: status priority and colors, hierarchy swap desktop/mobile, sign-preserving formatting, tooltip equations/units/reference APR, unknown data, stale timestamps, loading, navigation/account switch. Keyboard focus/escape and touch opening for tooltips; no hover-only access.

Live read-only review must capture: chain, market/version, Controller/AMM, public wallet, block number/time, raw full health, debt/balances/prices, APR observation time and history evidence. Compare displayed buffer sign to verified predicate and amount to raw debt*health. Use public market participants or user-provided positions, not invented addresses. Select representative Correlated, Blue-chip, Long-tail cases and at least one converted position. API client is research-only; production code uses typed queries. Do not claim a live case passed if only a story or mock was exercised.

Rare states (eligible above range, incomplete conversion, zero/negative equity, close/reopen) can use deterministic fixtures and contract-backed fork tests where practical; label simulated vs observed evidence. No transactions on live positions. No live real-position coverage was completed during preparation of this plan.

Acceptance: all agreed formulas/status/visibility rules pass focused tests; units verified; old feature flag behavior remains intact; transactions unaffected; design checked at mobile/desktop; a source/block evidence record exists for each live-supported implementation; unsupported gaps visibly degrade without fabricated values. All metrics have readable calculation/source tooltips. Warning configuration is visibly provisional and centrally editable.

## 10. Outstanding gates and deliverables

Unresolved items must not be hidden behind plausible defaults:
1. Deployed implementation matching across supported lend/mint versions and same-block live checks.
2. Explicit Blue-chip/Long-tail assignments (PR currently stable/volatile), dependency integration, provisional threshold values.
3. Actual history ordering, completeness/pagination, leverage route coverage and close/reopen evidence.
4. Intrinsic yield semantics for additional wrappers/rebasing debt assets; future LP borrower reward eligibility/feed.
5. Any Figma-only "total range liquidity" definition and data source.

These do not block pure helpers, stories or layout work. They block claiming the affected metric/state is verified for an unsupported live market. Bring unresolved factual/product assignments back with concrete evidence; do not invent them.

Cursor delivers: isolated prototype branch, scoped diff, runnable preview instructions and read-only position selection instructions, state stories/tests, evidence and threshold notes, and a concise validation report distinguishing observed/forked/mocked cases. Documentation updates should be drafted alongside final agreed semantics but not published as part of this local prototype.
