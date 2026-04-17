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

**Location:** [`apps/main/src/llamalend/queries/market-list/constants.ts`](apps/main/src/llamalend/queries/market-list/constants.ts)

LlamaLend market deprecations are defined in the `DEPRECATED_LLAMAS` constant. `llama-markets.ts` reads from that constant and maps matching markets to a `deprecatedMessage` field. When set, the market surfaces a deprecation notice to the user. Markets with a deprecation message will be excluded from listings, while still remaining accessible to users with existing positions.

## Summary

| Mechanism   | Scope   | Effect                                 | Location                                                                         |
| ----------- | ------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| Blacklist   | Pools   | Hidden from front-end                  | [`pools-blacklist.query.ts`](apps/main/src/dex/queries/pools-blacklist.query.ts) |
| Blacklist   | Tokens  | Shown as disabled in token selector    | [`blacklist.ts`](packages/curve-ui-kit/src/features/select-token/blacklist.ts)   |
| Deprecation | Pools   | Warning shown, actions may be disabled | [`usePoolAlert.tsx`](apps/main/src/dex/hooks/usePoolAlert.tsx)                   |
| Deprecation | Markets | Deprecation message shown              | [`constants.ts`](apps/main/src/llamalend/queries/market-list/constants.ts)       |
