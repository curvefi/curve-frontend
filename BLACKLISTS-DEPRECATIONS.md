# Content Filtering: Blacklists and Deprecations

This document is for both programmers and non-programmers that maintain the repository.
It explains the two mechanisms used to hide or restrict pools, markets, and tokens on the front-end: **blacklisting** and **deprecation**.

## Blacklists

Blacklists are hard restrictions. Blacklisted pools are hidden from the front-end entirely. Blacklisted tokens are shown as disabled, preventing users from selecting them.

### Pool Blacklist

**Location:** [`apps/main/src/dex/queries/pools-blacklist.query.ts`](apps/main/src/dex/queries/pools-blacklist.query.ts)

Pools can be blacklisted in two ways:

1. **Prices API blacklist** — A remote list maintained at `https://prices.curve.finance`. This is fetched at runtime and combined with the local list. This currently includes pools without a verified oracle.
2. **Local hardcoded blacklist** — A local list in the file above, used in addition to the Prices API blacklist. Supported chains extend beyond the Prices API and include `avalanche`, `moonbeam`, and `kava`.

### Token Blacklist

**Location:** [`packages/curve-ui-kit/src/features/select-token/blacklist.ts`](packages/curve-ui-kit/src/features/select-token/blacklist.ts)

Tokens can be blacklisted from token selection modals. Blacklisted tokens are shown as **disabled with a tooltip** (rather than hidden) to avoid user confusion.

This blacklist exists primarily for regulatory compliance. Each entry contains the token contract address and an optional reason.

## Deprecations

Deprecations are soft restrictions. They are less severe than blacklists and are intended to guide **existing users with open positions** to migrate away, rather than to block all access.

Deprecated items may display a warning message and can optionally be hidden from listings entirely if a user has no existing position.

### Pool Deprecations

**Location:** [`apps/main/src/dex/hooks/usePoolAlert.tsx`](apps/main/src/dex/hooks/usePoolAlert.tsx)

Pools can be deprecated by associating them with an alert. Alerts can:

- Display an informational banner with a title, description, and optional "learn more" link.
- Disable deposits, swaps, or withdrawals selectively.
- Be shown inline in the pool form or only in a tooltip.

Examples of deprecation reasons include protocol exploits, vulnerabilities, misconfigured pools, and discontinued underlying assets (e.g. EURT).

### Market Deprecations

**Location:** [`apps/main/src/llamalend/llama-markets.constants.ts`](apps/main/src/llamalend/llama-markets.constants.ts), [`apps/main/src/llamalend/queries/market-list/llama-markets.ts`](apps/main/src/llamalend/queries/market-list/llama-markets.ts)

LlamaLend market deprecations can be either:

- **Automatic** for lend markets when solvency drops below the configured low-solvency threshold.
- **Static** via the `DEPRECATED_LLAMAS` constant.

`llama-markets.ts` maps both cases to the `deprecatedMessage` field on each market.

If both apply, the static deprecation from `DEPRECATED_LLAMAS` takes priority over the automatic low-solvency deprecation.

For lend markets, solvency is derived from market bad debt and total assets. If solvency falls below `90%`, the market is automatically marked deprecated with a low-solvency message.

Markets with a deprecation message are hidden from the market list for new users by default. They remain visible to users with existing positions, and can also be shown when the deprecated-markets preference is enabled.

### Market Alerts

**Location:** [`apps/main/src/llamalend/llama-markets.constants.ts`](apps/main/src/llamalend/llama-markets.constants.ts)

LlamaLend also has a separate market alert mechanism for cases where a market should stay visible but new actions should be discouraged or blocked.

These alerts are distinct from `DEPRECATED_LLAMAS`. They can show a banner on the market detail page, or disable creating new borrow positions, and disable new supply deposits.

### Automatic Low-Solvency Protections

**Location:** [`apps/main/src/llamalend/llama-markets.constants.ts`](apps/main/src/llamalend/llama-markets.constants.ts), [`apps/main/src/llamalend/widgets/banners/BadDebtBanner.tsx`](apps/main/src/llamalend/widgets/banners/BadDebtBanner.tsx), [`apps/main/src/llamalend/widgets/action-card/hooks/useLowSolvencyForm.ts`](apps/main/src/llamalend/widgets/action-card/hooks/useLowSolvencyForm.ts)

LlamaLend lend markets now also apply automatic protections based on solvency thresholds defined in `SOLVENCY_THRESHOLDS`:

- **Below `99.9%` solvency**: a bad-debt solvency banner is shown automatically on the market page.
- **From `90%` up to `99.9%` solvency**: deposits and new borrow positions are still allowed, but the user must acknowledge a confirmation modal before submitting `Deposit` or `Create Loan`.
- **Below `90%` solvency**: the market is treated as deprecated for new users, hidden from the market list unless the user already has a position, and both new deposits and new borrow positions are disabled.

These automatic protections only apply to **lend markets**. Mint markets keep using the existing static alert/deprecation mechanisms.

## Summary

| Mechanism   | Scope         | Effect                                                                                     | Location                                                                           |
| ----------- | ------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Blacklist   | Pools         | Hidden from front-end                                                                      | [`pools-blacklist.query.ts`](apps/main/src/dex/queries/pools-blacklist.query.ts)   |
| Blacklist   | Tokens        | Shown as disabled in token selector                                                        | [`blacklist.ts`](packages/curve-ui-kit/src/features/select-token/blacklist.ts)     |
| Deprecation | Pools         | Warning shown, actions may be disabled                                                     | [`usePoolAlert.tsx`](apps/main/src/dex/hooks/usePoolAlert.tsx)                     |
| Deprecation | Markets       | Hidden for new users when deprecated; existing users still retain access                   | [`llama-markets.constants.ts`](apps/main/src/llamalend/llama-markets.constants.ts) |
| Deprecation | Market alerts | Warning shown, borrow/deposit may be disabled                                              | [`llama-markets.constants.ts`](apps/main/src/llamalend/llama-markets.constants.ts) |
| Deprecation | Low solvency  | Banner below `99.9%`; confirmation modal from `90%` to `99.9%`; hidden/blocked below `90%` | [`llama-markets.constants.ts`](apps/main/src/llamalend/llama-markets.constants.ts) |
