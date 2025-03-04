import { Trans } from '@ui-kit/lib/i18n'
import styled from 'styled-components'
import { formatNumber } from '@ui/utils'
import Checkbox from '@ui/Checkbox'
import AlertBox from '@ui/AlertBox'
import { Dispatch, SetStateAction } from 'react'

type SharedProps = {
  confirmed: boolean
  setConfirmed: Dispatch<SetStateAction<boolean>>
}

interface SlippageType extends SharedProps {
  slippage: boolean
  value: number
  transferType: 'Withdrawal' | 'Deposit'
}

interface LowExchangeRateType extends SharedProps {
  lowExchangeRate: boolean
  exchangeRate: string
  toAmount: string
  toToken: string
}

interface PriceImpactType extends SharedProps {
  priceImpact: boolean
  value: string
  toAmount: string
  toToken: string
}

interface PriceImpactLowExchangeRateType extends SharedProps {
  priceImpactLowExchangeRate: boolean
  value: string
  exchangeRate: string
  toAmount: string
  toToken: string
}

export type HighSlippagePriceImpactProps =
  | SlippageType
  | LowExchangeRateType
  | PriceImpactType
  | PriceImpactLowExchangeRateType

// TODO: refactor types
function WarningModal({
  confirmed,
  setConfirmed,
  ...props
}: HighSlippagePriceImpactProps & { toAmount?: string; exchangeRate?: string; value?: string | number | null }) {
  const handleSlippageChange = (isSlippageConfirmed: boolean) => {
    setConfirmed(isSlippageConfirmed)
  }
  const formattedToAmount = formatNumber(props?.toAmount)
  const formattedExchangeRate = formatNumber(props?.exchangeRate, { style: 'percent', maximumFractionDigits: 4 })
  const formattedValue = formatNumber(props?.value, { style: 'percent', maximumFractionDigits: 4 })

  return (
    <>
      <StyledAlertBox alertType="error">
        {'slippage' in props ? (
          <Trans>
            High slippage!
            <br />
            {props.transferType} will have {props.value}% loss.
          </Trans>
        ) : (
          <span>
            <AlertBoxImportantText>
              Receiving {formattedToAmount} {props.toToken}.
            </AlertBoxImportantText>
            {'lowExchangeRate' in props ? (
              <Trans>This swap has a low exchange rate ({formattedExchangeRate}).</Trans>
            ) : 'priceImpact' in props ? (
              <Trans>This swap has a high price impact ({formattedValue}).</Trans>
            ) : 'priceImpactLowExchangeRate' in props ? (
              <Trans>
                This swap has a high price impact ({formattedValue}) and low exchange rate ({formattedExchangeRate}).
              </Trans>
            ) : null}
          </span>
        )}
      </StyledAlertBox>

      <StyledCheckbox isSelected={confirmed} onChange={handleSlippageChange}>
        <Trans>Confirm warning to proceed.</Trans>
      </StyledCheckbox>
    </>
  )
}

const StyledAlertBox = styled(AlertBox)`
  line-height: 1.25;

  svg {
    position: relative;
    top: 5px;
  }
`

const StyledCheckbox = styled(Checkbox)`
  margin-top: 1rem;
`

const AlertBoxImportantText = styled.div`
  font-size: var(--font-size-6);
  font-weight: bold;
  padding-bottom: 0.25rem;
`

export default WarningModal
