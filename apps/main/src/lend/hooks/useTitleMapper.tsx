import { TitleMapper } from '@/lend/types/lend.types'
import { Box } from '@ui/Box'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { t } from '@ui-kit/lib/i18n'

export const useTitleMapper = (): TitleMapper => ({
  isInMarket: { title: '' },
  name: { title: t`Markets` },
  available: { title: t`Available` },
  cap: { title: t`Supplied` },
  utilization: { title: t`Utilization` },
  rateBorrow: { title: t`Borrow APY` },
  rateLend: { title: t`Lend Total APR` },
  myDebt: { title: t`My debt` },
  myHealth: { title: t`My health` },
  myVaultShares: { title: t`Earning deposits` },
  tokenCollateral: { title: t`Collateral` },
  tokenBorrow: { title: t`Borrow` },
  tokenSupply: { title: t`Lend` },
  totalCollateralValue: { title: t`Collateral value` },
  totalDebt: { title: t`Borrowed` },
  totalLiquidity: { title: t`TVL` },
  totalApr: { title: t`Total APR` },
  points: { title: t`Points` },
  leverage: { title: t`Leverage` },
  vaultShares: { title: t`Vault shares` },
  healthStatus: {
    title: t`Health status`,
    tooltip: (
      <Box grid gridGap={2}>
        <p>{t`The loan metric indicates the current health of your position.`}</p>
        <p>
          {t`Hard liquidation may be triggered when health is 0 or below.`}{' '}
          <ExternalLink href="https://resources.curve.finance/crvusd/loan-concepts/#hard-liquidations" $noStyles>
            Click here to learn more.
          </ExternalLink>
        </p>
      </Box>
    ),
    tooltipProps: { minWidth: '250px', clickable: true },
  },
  healthPercent: { title: t`Health %` },
  liquidationRange: { title: t`Liquidation range` },
  liquidationBandRange: { title: t`Band range` },
  liquidationRangePercent: { title: t`Range %` },
  lossCollateral: {
    title: (
      <>
        {t`Collateral`}
        <br />
        {t`Current balance (est.) / Deposited`}
      </>
    ),
  },
  lossAmount: { title: t`Loss amount` },
  lossPercent: {
    title: t`% lost`,
    tooltip: t`This metric measures the loss in collateral value caused by LLAMMA's soft liquidation process, which is activated when the oracle price falls within a user’s liquidation range.`,
    tooltipProps: { minWidth: '300px' },
  },
  llammaBalances: { title: t`LLAMMA Balances` },
  positionCurrentLeverage: { title: t`Position leverage` },
})
