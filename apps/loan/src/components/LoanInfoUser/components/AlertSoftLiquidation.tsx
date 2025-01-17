import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'
import { getTokenName } from '@/utils/utilsLoan'
import useStore from '@/store/useStore'

import AlertBox from '@/ui/AlertBox'
import Box from '@/ui/Box'
import ExternalLink from '@/ui/Link/ExternalLink'
import { Llamma } from '@/types/loan.types'

const AlertSoftLiquidation = ({ llammaId, llamma }: { llammaId: string; llamma: Llamma | null }) => {
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])

  const { collateral = '0', stablecoin = '0' } = userLoanDetails?.userState ?? {}

  const softLiquidationAmountText = useMemo(() => {
    let text = ''
    text += +collateral > 0 ? `${formatNumber(collateral)} ${getTokenName(llamma).collateral}` : ''

    if (+stablecoin > 0) {
      const stablecoinText = `${formatNumber(stablecoin)} ${getTokenName(llamma).stablecoin}`
      text += text ? ` and ${stablecoinText}` : stablecoinText
    }

    return text
  }, [collateral, stablecoin, llamma])

  return (
    <AlertBox alertType="warning">
      <Box grid gridGap={3}>
        <p>{t`You are in soft-liquidation mode. The amount currently at risk is ${softLiquidationAmountText}. In this mode, you cannot partially withdraw or add more collateral to your position. To reduce the risk of hard liquidation, you can repay or, to exit soft liquidation, you can close (self-liquidate).`}</p>
        <p>
          {t`Hard liquidation is triggered when health is 0 or below.`}{' '}
          <ExternalLink href="https://resources.curve.fi/crvusd/loan-concepts/#hard-liquidations" $noStyles>
            Click here to learn more.
          </ExternalLink>
        </p>
      </Box>
    </AlertBox>
  )
}

export default AlertSoftLiquidation
