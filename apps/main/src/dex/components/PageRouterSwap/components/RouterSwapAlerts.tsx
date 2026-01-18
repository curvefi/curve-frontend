import lodash from 'lodash'
import { useMemo } from 'react'
import { useChainId } from 'wagmi'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { AlertSlippage } from '@/dex/components/AlertSlippage'
import type { FormStatus, FormValues, SearchedParams } from '@/dex/components/PageRouterSwap/types'
import { AlertBox } from '@ui/AlertBox'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

const { isUndefined, isNaN } = lodash

export const RouterSwapAlerts = ({
  formStatus,
  formValues,
  maxSlippage,
  toAmountOutput,
  isExchangeRateLow,
  isHighImpact,
  isExpectedToAmount,
  searchedParams,
  updateFormValues,
}: {
  formStatus: FormStatus
  formValues: FormValues
  maxSlippage: string
  toAmountOutput: string | undefined
  isExchangeRateLow: boolean | undefined
  isHighImpact?: boolean
  isExpectedToAmount?: boolean
  searchedParams: SearchedParams
  updateFormValues: (
    updatedFormValues: Partial<FormValues>,
    isGetMaxFrom?: boolean,
    maxSlippage?: string,
    isFullReset?: boolean,
  ) => void
}) => {
  const { error, swapError } = formStatus
  const { toAddress } = searchedParams

  const chainId = useChainId()
  const { data: toUsdRate } = useTokenUsdRate({ chainId, tokenAddress: toAddress })

  const usdToAmount = useMemo(
    () =>
      !isUndefined(toUsdRate) && !isNaN(toUsdRate) ? (Number(formValues.toAmount) * Number(toUsdRate)).toString() : '',
    [formValues.toAmount, toUsdRate],
  )

  return (
    <>
      {isHighImpact && <AlertBox alertType="error">{t`Warning! High price impact!`}</AlertBox>}
      {isExchangeRateLow && <AlertBox alertType="error">{t`Warning! Exchange rate is too low!`}</AlertBox>}
      {isExpectedToAmount && (
        <AlertBox alertType="warning">{t`The expected amount you would like to receive, ${formValues.toAmount}, will actually be ${toAmountOutput}.`}</AlertBox>
      )}

      <AlertSlippage maxSlippage={maxSlippage} usdAmount={usdToAmount} />

      <AlertFormError errorKey={swapError || error} handleBtnClose={() => updateFormValues({})} />
    </>
  )
}
