import { Dispatch, SetStateAction } from 'react'
import { styled } from 'styled-components'
import { AlertBox } from '@ui/AlertBox'
import { Checkbox } from '@ui/Checkbox'
import { t, Trans } from '@ui-kit/lib/i18n'
import { formatNumber, amount } from '@ui-kit/utils'

type SharedProps = {
  confirmed: boolean
  setConfirmed: Dispatch<SetStateAction<boolean>>
}

type SlippageType = {
  slippage: boolean
  value: number
  transferType: 'Withdrawal' | 'Deposit'
} & SharedProps

type LowExchangeRateType = {
  lowExchangeRate: boolean
  exchangeRate: string
  toAmount: string
  toToken: string
} & SharedProps

type PriceImpactType = {
  priceImpact: boolean
  value: string
  toAmount: string
  toToken: string
} & SharedProps

type PriceImpactLowExchangeRateType = {
  priceImpactLowExchangeRate: boolean
  value: string
  exchangeRate: string
  toAmount: string
  toToken: string
} & SharedProps

export type HighSlippagePriceImpactProps =
  SlippageType | LowExchangeRateType | PriceImpactType | PriceImpactLowExchangeRateType

// TODO: refactor types
export function WarningModal({
  confirmed,
  setConfirmed,
  ...props
}: HighSlippagePriceImpactProps & { toAmount?: string; exchangeRate?: string; value?: string | number | null }) {
  const handleSlippageChange = (isSlippageConfirmed: boolean) => {
    setConfirmed(isSlippageConfirmed)
  }
  const formattedToAmount = formatNumber(amount(props?.toAmount), { abbreviate: false, fallback: '-' })
  const formattedExchangeRate = formatNumber(amount(props?.exchangeRate), {
    maximumFractionDigits: 4,
    unit: 'percentage',
    abbreviate: false,
    fallback: '-',
  })
  const formattedValue = formatNumber(amount(props?.value), {
    maximumFractionDigits: 4,
    unit: 'percentage',
    abbreviate: false,
    fallback: '-',
  })

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
        {t`Confirm warning to proceed.`}
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
