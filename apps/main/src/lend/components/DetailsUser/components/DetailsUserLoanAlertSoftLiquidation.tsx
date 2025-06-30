import { useMemo } from 'react'
import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import { PageContentProps } from '@/lend/types/lend.types'
import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import ExternalLink from '@ui/Link/ExternalLink'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

const DetailsUserLoanAlertSoftLiquidation = ({ market, userActiveKey }: PageContentProps) => {
  const { borrowed_token, collateral_token } = market ?? {}
  const { state } = useUserLoanDetails(userActiveKey)

  const softLiquidationAmountText = useMemo(() => {
    let text = ''
    const { collateral = '0', borrowed = '0' } = state ?? {}

    text += +collateral > 0 ? `${formatNumber(collateral)} ${collateral_token?.symbol}` : ''

    if (+borrowed > 0) {
      const borrowedText = `${formatNumber(borrowed)} ${borrowed_token?.symbol}`
      if (text) {
        text += ` and ${borrowedText}`
      } else {
        text += borrowedText
      }
    }

    return text
  }, [borrowed_token?.symbol, collateral_token?.symbol, state])

  return (
    <AlertBox alertType="warning">
      <Box grid gridGap={3}>
        <p>{t`You are in soft-liquidation mode. The amount currently at risk is ${softLiquidationAmountText}. In this mode, you cannot partially withdraw or add more collateral to your position. To reduce the risk of hard liquidation, you can repay or, to exit soft liquidation, you can close (self-liquidate).`}</p>
        <p>
          {t`Hard liquidation may be triggered when health is 0 or below.`}{' '}
          <ExternalLink href="https://resources.curve.finance/lending/overview/#health-hard-liquidation" $noStyles>
            Click here to learn more.
          </ExternalLink>
        </p>
      </Box>
    </AlertBox>
  )
}

export default DetailsUserLoanAlertSoftLiquidation
