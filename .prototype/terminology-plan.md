# LlamaLend terminology update

## Intent

Use concise, consistent Beta labels across headers, tables, position cards, action details, tooltips and tours. Preserve Stable and Legacy presentation, manual edits, calculations and transactions.

## Agreed copy

| Context                             | Copy                                                              |
| ----------------------------------- | ----------------------------------------------------------------- |
| Adjusted borrowing rate             | Est. net borrow APR                                               |
| Subline beneath Borrow APR          | Est. net                                                          |
| Borrow breakdown                    | Borrow rate breakdown                                             |
| Combined supply rate                | Total supply APY                                                  |
| Subline beneath Supply APY          | Total                                                             |
| Personal supply rate                | Your total supply APY                                             |
| Supply breakdown                    | Supply yield breakdown                                            |
| Supplied underlying tokens          | Amount supplied                                                   |
| Debt amount                         | Total debt                                                        |
| Collateral amount                   | Collateral                                                        |
| Collateral attributable to leverage | Collateral from leverage                                          |
| Combined collateral amount          | Total collateral                                                  |
| Range presets                       | Liquidation range setup                                           |
| Range distance                      | Distance to range                                                 |
| Debt-relative margin                | Liquidation buffer                                                |
| Borrower collateral rate            | Collateral yield APR                                              |
| Supplied asset's intrinsic rate     | Token yield APY                                                   |
| User's share of market supply       | Supply share                                                      |
| Market backing ratio                | Market solvency                                                   |
| Position annual rate                | Estimated leveraged APR; Est. leveraged APR in tables             |
| Market scenario                     | Estimated APR at max leverage; Est. APR at max leverage in tables |
| Card yield multiple                 | 2.4× collateral yield                                             |
| Table yield multiple                | 2.4× yield                                                        |
| A parameter                         | Band width factor (A)                                             |
| Reset action                        | Reset position                                                    |

## Presentation and explanations

- Keep Amount supplied identical across market types and setups. Underlying token quantity and symbol lead; USD value appears beneath. Do not label this metric Supplied value or imply all supplied tokens are immediately withdrawable.
- Total supply APY includes supply interest, intrinsic token yield and eligible rewards. Token reward APRs are converted to APY assuming weekly reinvestment; this is a model, not automatic compounding. Preserve existing conversion arithmetic and explain the assumption in the tooltip, breakdown and supply tour.
- Keep Health and Collateral value. Explain that 1.00 marks entry into the liquidation range, where collateral can convert and losses can occur. Health stays at 1.00 within and below the range; buffer and status provide further context.
- Show the price change needed to reach the range: negative above it (price drop), positive below it (price rise), and In range at either boundary and within the range. Preserve precision and unavailable states; provide written direction to assistive technology.
- Keep Liquidation buffer short and append of debt to its percentage, including tables and action details. Preserve existing colours and amount sublines.
- Reset description: Use converted collateral and optional wallet funds to reduce debt and reset the liquidation range.
- Use APR inputs for Beta APR estimates; never substitute APY for missing APR. Keep supply APY conversion separate.

## Implementation

Share Beta labels and formatting. Keep internal IDs and saved settings. Update tooltips, tour explanations and affected tour content versions without moving targets or changing tour order. Preserve position-card layout. Replace the review notes with the agreed terminology and this plan reference.

## Checks

Verify signed distances, boundaries, small values, unavailable data, debt units, multiplier states, token-first supplied amounts and reward compounding. Run existing metric and APR regression checks, targeted lint and type checking. Inspect desktop/mobile presentation and Beta/Stable/Legacy labels.
