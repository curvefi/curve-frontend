import React from 'react'
import { t } from '@lingui/macro'

import Box from '@ui/Box'
import ExternalLink from '@ui/Link/ExternalLink'

const useTitleMapper = (): TitleMapper => ({
  isInMarket: { title: '' },
  name: { title: t`Markets` },
  tokenCollateral: { title: t`Collateral` },
  tokenBorrow: { title: t`Borrow` },
  myDebt: { title: t`My debt` },
  myHealth: { title: t`My health` },
  rate: {
    title: t`Borrow rate`,
    tooltip: t`The borrow rate changes with supply and demand for crvUSD, reflected in the price and total debt versus PegKeeper debt.  Rates increase to encourage debt reduction, and decrease to encourage borrowing.`,
    tooltipProps: { minWidth: '200px', textAlign: 'left' },
  },
  available: { title: t`Available` },
  totalBorrowed: { title: t`Borrowed` },
  cap: { title: t`Cap` },
  totalCollateral: { title: t`Collateral value` },
  healthStatus: {
    title: t`Health status`,
    tooltip: (
      <Box grid gridGap={2}>
        <p>{t`The loan metric indicates the current health of your position.`}</p>
        <p>
          {t`Hard liquidation is triggered when health is 0 or below.`}{' '}
          <ExternalLink href="https://resources.curve.fi/crvusd/loan-concepts/#hard-liquidations" $noStyles>
            Click here to learn more.
          </ExternalLink>
        </p>
      </Box>
    ),
    tooltipProps: { minWidth: '250px' },
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
})

export default useTitleMapper
