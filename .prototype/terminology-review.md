# LlamaLend terminology

[Agreed plan and copy](terminology-plan.md).

## Invariants

- Estimated leveraged APR describes a current annual rate estimate, not realised return or PnL. Use Est. leveraged APR in tables and Estimated APR at max leverage for the market scenario. Internal RoE IDs remain.
- APR estimates use APR inputs; missing APR stays unavailable. Supply token rewards use weekly APR-to-APY conversion without implying automatic reinvestment.
- Amount supplied remains a token quantity with its symbol; USD is the supporting notional. Its label is identical across market types and setups.
- Health and Collateral value retain their names. Range distance has a direction; liquidation-buffer percentages identify debt as their reference.
- Beta aliases preserve Stable/Legacy wording, stored preferences, manual edits and position-card layout.
