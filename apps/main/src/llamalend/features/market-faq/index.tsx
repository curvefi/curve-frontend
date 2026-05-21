import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type FaqItem = {
  question: string
  answer: string
}

type FaqGroup = {
  title: string
  items: FaqItem[]
}

const FAQ_GROUPS: FaqGroup[] = [
  {
    title: 'Core Understanding',
    items: [
      {
        question: 'What is LlamaLend?',
        answer:
          "LlamaLend is Curve's non-custodial lending infrastructure. All markets are one-way isolated: each market has one collateral and one borrowable asset, and your collateral is isolated to that specific market and is not rehypothecated into other markets. That isolation reduces risk and keeps exposure easy to understand.",
      },
      {
        question: 'How does LlamaLend work?',
        answer:
          'Borrowing: You deposit collateral and borrow against it. You pay a dynamic borrow rate; there are no opening or closing fees. Supplying: In lending markets you deposit assets into a vault; borrowers pay interest and you earn a share of that (the supply rate), which accrues automatically. You may also earn staking incentives e.g. CRV if the market has any.',
      },
      {
        question: 'What is LLAMMA and why does it matter?',
        answer:
          'LLAMMA (Lending-Liquidating AMM Algorithm) is the mechanism that powers Curve\'s liquidation protection. It is a market-making contract that manages the gradual conversion of collateral into the borrowed asset and back, via arbitrageurs, as the collateral price moves. Instead of instant, one-shot liquidations, LLAMMA lets your position be adjusted gradually when price enters a "protection range", giving you more time and potentially smaller losses than a full liquidation.',
      },
    ],
  },
  {
    title: 'Risk & Liquidation',
    items: [
      {
        question: 'What is "Health"?',
        answer:
          "Health is a value (not a percentage) that indicates how close your loan is to full liquidation. The lower it gets, the closer you are to being fully liquidated. Health decreases when collateral price drops, when you're in liquidation protection (conversion costs), or when debt grows (interest). When health reaches zero, the loan can be fully liquidated. Monitor health in the UI and consider repaying or adding collateral when it gets low.",
      },
      {
        question: 'When does liquidation happen?',
        answer:
          "Full liquidation happens when your loan's health reaches zero. Before that, if the collateral price moves into your liquidation protection range, your loan enters liquidation protection where the system starts gradually converting collateral; that is not full liquidation yet.",
      },
      {
        question: 'Is liquidation instant or gradual?',
        answer:
          'Liquidation protection is gradual: as price moves through your protection range, collateral is converted step by step into the borrowed asset via the LLAMMA. If price moves back up through the range, the borrowed asset is converted back into collateral. Full liquidation happens when health reaches zero: your position is closed, the debt is repaid and your collateral is transferred in exchange. You lose the collateral and the position.',
      },
      {
        question: 'What is liquidation protection?',
        answer:
          'Liquidation protection is Curve\'s mechanism for gradually adjusting your position when price moves into your "protection range." The system converts collateral into the borrowed asset (and back if price recovers) instead of closing the loan in one go. That gives you a buffer and more time to repay. If health reaches zero, the position can be fully liquidated: the debt is repaid and the collateral is transferred in exchange; you lose the position.',
      },
      {
        question: 'Can I lose all my collateral?',
        answer:
          "In a full liquidation (health = 0), your position is closed: the debt is repaid and your collateral is lost. During liquidation protection, you can have conversion losses (from the gradual swaps), which reduce your effective collateral and can push health down - so it's possible to end up with less collateral or, in the worst case, lose the position if health reaches zero.",
      },
      {
        question: 'Can I be partially liquidated?',
        answer:
          'Yes. During liquidation protection, parts of your collateral are gradually converted into the borrowed asset as price moves through your protection range. This reduces your effective collateral but does not immediately close your loan. Only when health reaches zero does full liquidation occur.',
      },
      {
        question: 'What can I do when liquidation protection is active?',
        answer:
          'While your loan is in liquidation protection you can repay debt (in part or in full). You cannot add or remove collateral or borrow more. Repaying debt improves health. Only full repayment (and closing the loan) or the collateral price moving back above your protection range will take you out of liquidation protection.',
      },
      {
        question: 'How can I reduce my liquidation risk?',
        answer:
          'Use a lower LTV (borrow less against your collateral), choose more bands when opening the loan (this spreads liquidation protection over a wider price range), monitor health regularly, and repay debt or add collateral when health gets low. Avoid letting health get close to zero.',
      },
    ],
  },
  {
    title: 'Borrowing & Market Mechanics',
    items: [
      {
        question: 'What is Borrow APR and how does it change?',
        answer:
          "Borrow APR is the annualized interest rate you pay on your debt. It is dynamic. In mint markets (where the borrowed asset is crvUSD), it depends on crvUSD's price and the Peg Stabilization Reserve (PSR) - e.g. higher when crvUSD is below peg, lower when above. In lending markets, it depends only on utilization (how much of supplied assets is borrowed): higher utilization means higher borrow APR. Interest accrues every second and is added to your debt.",
      },
      {
        question: 'What is the admin fee?',
        answer:
          "Markets that include crvUSD (as collateral or borrowable asset) have a 0% admin fee. Markets that do not include crvUSD have a 10% admin fee: 10% of all borrow interest charged in that market goes to the Curve DAO; the rest goes to suppliers (in lending markets) or according to the market's design.",
      },
      {
        question: 'What is utilization and how does it affect rates?',
        answer:
          "Utilization = (amount borrowed / total supplied) in that market. It only applies to lending markets (mint markets have no supply side). Higher utilization means higher borrow APR (more expensive to borrow) and higher supply APR (lenders earn more). Rates move within the market's min/max range as utilization changes.",
      },
    ],
  },
  {
    title: 'Lending',
    items: [
      {
        question: 'What is Supply APR and how does it work?',
        answer:
          'Supply APR is the annualized rate you earn on your supplied balance. It equals utilization x borrow rate: you earn a share of the interest borrowers pay. It is variable and changes automatically as utilization changes. The rate accrues every second and grows your balance automatically. In lending markets you may also earn staking incentives (e.g. CRV) if the market has gauge weight; those usually need to be claimed.',
      },
      {
        question: 'Are my supplied funds subject to lockups?',
        answer:
          'No. You can withdraw whenever there is enough free liquidity in the vault (i.e. not currently borrowed). If utilization is high, you may need to wait until borrowers repay or others supply.',
      },
    ],
  },
]

export const MarketFaq = () => (
  <Stack component="section" gap={0} data-testid="llamalend-market-faq">
    <Stack minHeight="3.5rem" justifyContent="end" paddingBlockEnd={Spacing.xs}>
      <Typography variant="headingSBold" color="textSecondary">
        {t`FAQs`}
      </Typography>
    </Stack>

    <Stack>
      {FAQ_GROUPS.map(group => (
        <Stack key={group.title} gap={Spacing.xs}>
          <Stack
            minHeight="2.5rem"
            justifyContent="end"
            paddingBlockEnd={Spacing.xs}
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="headingXsBold" color="textSecondary">
              {t(group.title)}
            </Typography>
          </Stack>

          <Stack gap={Spacing.xs} paddingInlineStart={Spacing.md}>
            {group.items.map(item => (
              <Accordion
                key={item.question}
                title={t(item.question)}
                ghost
                indicator="plusMinus"
                sx={{ paddingBlock: Spacing.md }}
              >
                <Typography variant="bodyMRegular" color="textPrimary">
                  {t(item.answer)}
                </Typography>
              </Accordion>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>

    <Stack alignItems="center" gap={Spacing.sm} paddingBlock={Spacing.md}>
      <Typography variant="bodyMRegular" color="textPrimary" textAlign="center">
        {t`Want to know even more?`}
      </Typography>
      <ExternalLink
        href="https://docs.curve.finance/user/llamalend/overview"
        label={t`Go to knowledge base`}
        variant="outlined"
        color="secondary"
      />
    </Stack>
  </Stack>
)
