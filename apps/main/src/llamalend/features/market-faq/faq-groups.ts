import { t } from '@ui/lib/i18n'

type FaqItem = { question: string; answer: string }

type FaqGroup = { title: string; items: FaqItem[] }

const CORE_GROUP: FaqGroup = {
  title: t`Core Understanding`,
  items: [
    {
      question: t`What is LlamaLend?`,
      answer: t`LlamaLend is Curve's non-custodial lending infrastructure. All markets are one-way isolated: each market has one collateral and one borrowable asset, and your collateral is isolated to that specific market and is not rehypothecated into other markets. That isolation reduces risk and keeps exposure easy to understand.`,
    },
    {
      question: t`How does LlamaLend work?`,
      answer: t`Borrowing: You deposit collateral and borrow against it. You pay a dynamic borrow rate; there are no opening or closing fees. Supplying: In lending markets you deposit assets into a vault; borrowers pay interest and you earn a share of that (the supply rate), which accrues automatically. You may also earn staking incentives e.g. CRV if the market has any.`,
    },
    {
      question: t`What is LLAMMA and why does it matter?`,
      answer: t`LLAMMA (Lending-Liquidating AMM Algorithm) is the mechanism that powers Curve's liquidation protection. It is a market-making contract that manages the gradual conversion of collateral into the borrowed asset and back, via arbitrageurs, as the collateral price moves. Instead of instant, one-shot liquidations, LLAMMA lets your position be adjusted gradually when price enters a "protection range", giving you more time and potentially smaller losses than a full liquidation.`,
    },
  ],
}

const RISK_GROUP: FaqGroup = {
  title: t`Risk & Liquidation`,
  items: [
    {
      question: t`What is "Health"?`,
      answer: t`Health shows how far the oracle price is above the top of your liquidation range. It is the oracle price divided by the top of the range, and it never goes below 1.00. Health stays at 1.00 while the price is inside or below the range. It does not tell you if you can be liquidated, so also check the liquidation buffer and the position status.`,
    },
    {
      question: t`What is the liquidation buffer?`,
      answer: t`The liquidation buffer is the margin your position has before it can be fully liquidated, shown as a percentage of your debt. Conversion losses and growing debt reduce it. When it falls below 0%, the position can be fully liquidated once the oracle price is at or below the top of your liquidation range.`,
    },
    {
      question: t`When does liquidation happen?`,
      answer: t`Full liquidation can happen when the oracle price is at or below the top of your liquidation range and your liquidation buffer is below 0%. Before that, if the collateral price moves into your liquidation protection range, your loan enters liquidation protection where the system starts gradually converting collateral. That is not full liquidation yet.`,
    },
    {
      question: t`Is liquidation instant or gradual?`,
      answer: t`Liquidation protection is gradual. As price moves through your protection range, collateral is converted step by step into the borrowed asset via the LLAMMA. If price moves back up through the range, the borrowed asset is converted back into collateral. Full liquidation can happen when the price is in or below your range and your liquidation buffer is below 0%. Then your position is closed, the debt is repaid and your collateral is transferred in exchange. You lose the collateral and the position.`,
    },
    {
      question: t`What is liquidation protection?`,
      answer: t`Liquidation protection is Curve's mechanism for gradually adjusting your position when price moves into your "protection range." The system converts collateral into the borrowed asset (and back if price recovers) instead of closing the loan in one go. That gives you a buffer and more time to repay. If your liquidation buffer falls below 0% while the price is in or below the range, the position can be fully liquidated. The debt is repaid and the collateral is transferred in exchange. You lose the position.`,
    },
    {
      question: t`Can I lose all my collateral?`,
      answer: t`In a full liquidation, your position is closed. The debt is repaid and your collateral is lost. During liquidation protection, you can have conversion losses from the gradual swaps. These losses reduce your liquidation buffer, so in the worst case you lose the position if the buffer falls below 0%.`,
    },
    {
      question: t`Can I be partially liquidated?`,
      answer: t`Yes. During liquidation protection, parts of your collateral are gradually converted into the borrowed asset as price moves through your protection range. This reduces your effective collateral but does not immediately close your loan. Full liquidation can only happen when your liquidation buffer is below 0% and the price is in or below your range.`,
    },
    {
      question: t`What can I do when liquidation protection is active?`,
      answer: t`While your loan is in liquidation protection you can repay debt (in part or in full). You cannot add or remove collateral or borrow more. Repaying debt increases your liquidation buffer. Only full repayment (and closing the loan) or the collateral price moving back above your protection range will take you out of liquidation protection.`,
    },
    {
      question: t`How can I reduce my liquidation risk?`,
      answer: t`Use a lower LTV (borrow less against your collateral), choose more bands when opening the loan (this spreads liquidation protection over a wider price range), monitor your liquidation buffer regularly, and repay debt or add collateral when it gets low. Avoid letting the buffer get close to 0%.`,
    },
  ],
}

const LEGACY_RISK_GROUP: FaqGroup = {
  title: t`Risk & Liquidation`,
  items: [
    {
      question: t`What is "Health"?`,
      answer: t`Health is a value (not a percentage) that indicates how close your loan is to full liquidation. The lower it gets, the closer you are to being fully liquidated. Health decreases when collateral price drops, when you're in liquidation protection (conversion costs), or when debt grows (interest). When health reaches 0, the loan can be fully liquidated. Monitor health in the UI and consider repaying or adding collateral (if above the liquidation range) when it gets low.`,
    },
    {
      question: t`When does liquidation happen?`,
      answer: t`Full liquidation happens when your loan's health reaches zero. Before that, if the collateral price moves into your liquidation protection range, your loan enters liquidation protection where the system starts gradually converting collateral; that is not full liquidation yet.`,
    },
    {
      question: t`Is liquidation instant or gradual?`,
      answer: t`Liquidation protection is gradual: as price moves through your protection range, collateral is converted step by step into the borrowed asset via the LLAMMA. If price moves back up through the range, the borrowed asset is converted back into collateral. Full liquidation happens when health reaches zero: your position is closed, the debt is repaid and your collateral is transferred in exchange. You lose the collateral and the position.`,
    },
    {
      question: t`What is liquidation protection?`,
      answer: t`Liquidation protection is Curve's mechanism for gradually adjusting your position when price moves into your "protection range." The system converts collateral into the borrowed asset (and back if price recovers) instead of closing the loan in one go. That gives you a buffer and more time to repay. If health reaches zero, the position can be fully liquidated: the debt is repaid and the collateral is transferred in exchange; you lose the position.`,
    },
    {
      question: t`Can I lose all my collateral?`,
      answer: t`In a full liquidation (health = 0), your position is closed: the debt is repaid and your collateral is lost. During liquidation protection, you can have conversion losses (from the gradual swaps), which reduce your effective collateral and can push health down - so it's possible to end up with less collateral or, in the worst case, lose the position if health reaches zero.`,
    },
    {
      question: t`Can I be partially liquidated?`,
      answer: t`Yes. During liquidation protection, parts of your collateral are gradually converted into the borrowed asset as price moves through your protection range. This reduces your effective collateral but does not immediately close your loan. Only when health reaches zero does full liquidation occur.`,
    },
    {
      question: t`What can I do when liquidation protection is active?`,
      answer: t`While your loan is in liquidation protection you can repay debt (in part or in full). You cannot add or remove collateral or borrow more. Repaying debt improves health. Only full repayment (and closing the loan) or the collateral price moving back above your protection range will take you out of liquidation protection.`,
    },
    {
      question: t`How can I reduce my liquidation risk?`,
      answer: t`Use a lower LTV (borrow less against your collateral), choose more bands when opening the loan (this spreads liquidation protection over a wider price range), monitor health regularly, and repay debt or add collateral when health gets low. Avoid letting health get close to zero.`,
    },
  ],
}

const BORROWING_GROUP: FaqGroup = {
  title: t`Borrowing & Market Mechanics`,
  items: [
    {
      question: t`What is Borrow APR and how does it change?`,
      answer: t`Borrow APR is the annualized interest rate you pay on your debt. It is dynamic. In mint markets (where the borrowed asset is crvUSD), it depends on crvUSD's price and the Peg Stabilization Reserve (PSR) - e.g. higher when crvUSD is below peg, lower when above. In lending markets, it depends only on utilization (how much of supplied assets is borrowed): higher utilization means higher borrow APR. Interest accrues every second and is added to your debt.`,
    },
    {
      question: t`What is the admin fee?`,
      answer: t`Markets that include crvUSD (as collateral or borrowable asset) have a 0% admin fee. Markets that do not include crvUSD have a 10% admin fee: 10% of all borrow interest charged in that market goes to the Curve DAO; the rest goes to suppliers (in lending markets) or according to the market's design.`,
    },
    {
      question: t`What is utilization and how does it affect rates?`,
      answer: t`Utilization = (amount borrowed / total supplied) in that market. It only applies to lending markets (mint markets have no supply side). Higher utilization means higher borrow APR (more expensive to borrow) and higher supply APR (lenders earn more). Rates move within the market's min/max range as utilization changes.`,
    },
  ],
}

const LENDING_GROUP: FaqGroup = {
  title: t`Lending`,
  items: [
    {
      question: t`What is Supply APR and how does it work?`,
      answer: t`Supply APR is the annualized rate you earn on your supplied balance. It equals utilization x borrow rate: you earn a share of the interest borrowers pay. It is variable and changes automatically as utilization changes. The rate accrues every second and grows your balance automatically. In lending markets you may also earn staking incentives (e.g. CRV) if the market has gauge weight; those usually need to be claimed.`,
    },
    {
      question: t`Are my supplied funds subject to lockups?`,
      answer: t`No. You can withdraw whenever there is enough free liquidity in the vault (i.e. not currently borrowed). If utilization is high, you may need to wait until borrowers repay or others supply.`,
    },
  ],
}

export const FAQ_GROUPS: FaqGroup[] = [CORE_GROUP, RISK_GROUP, BORROWING_GROUP, LENDING_GROUP]

export const LEGACY_FAQ_GROUPS: FaqGroup[] = [CORE_GROUP, LEGACY_RISK_GROUP, BORROWING_GROUP, LENDING_GROUP]
