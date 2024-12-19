import type { FormStatus, FormValues, RoutesAndOutput, SearchedParams } from '@/components/PageRouterSwap/types'

import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import isNaN from 'lodash/isNaN'
import isUndefined from 'lodash/isUndefined'
import useStore from '@/store/useStore'

import AlertBox from '@/ui/AlertBox'
import AlertFormError from '@/components/AlertFormError'
import AlertSlippage from '@/components/AlertSlippage'

const RouterSwapAlerts = ({
  formStatus,
  formValues,
  routesAndOutput,
  searchedParams,
  updateFormValues,
}: {
  formStatus: FormStatus
  formValues: FormValues
  routesAndOutput: RoutesAndOutput
  searchedParams: SearchedParams
  updateFormValues: (
    updatedFormValues: Partial<FormValues>,
    isGetMaxFrom?: boolean,
    maxSlippage?: string,
    isFullReset?: boolean,
  ) => void
}) => {
  const usdRatesMapper = useStore((state) => state.usdRates.usdRatesMapper)

  const { error, swapError } = formStatus
  const { toAddress } = searchedParams
  const { isExchangeRateLow, isExpectedToAmount, isHighImpact, toAmountOutput } = routesAndOutput ?? {}

  const toUsdRate = usdRatesMapper[toAddress]

  const usdToAmount = useMemo(() => !isUndefined(toUsdRate) && !isNaN(toUsdRate)
      ? (Number(formValues.toAmount) * Number(toUsdRate)).toString()
      : '', [formValues.toAmount, toUsdRate])

  return (
    <>
      {isHighImpact && <AlertBox alertType="error">{t`Warning! High price impact!`}</AlertBox>}
      {isExchangeRateLow && <AlertBox alertType="error">{t`Warning! Exchange rate is too low!`}</AlertBox>}
      {isExpectedToAmount && (
        <AlertBox alertType="warning">{t`The expected amount you would like to receive, ${formValues.toAmount}, will actually be ${toAmountOutput}.`}</AlertBox>
      )}

      <AlertSlippage maxSlippage={routesAndOutput?.maxSlippage} usdAmount={usdToAmount} />

      <AlertFormError errorKey={swapError || error} handleBtnClose={() => updateFormValues({})} />
    </>
  )
}

export default RouterSwapAlerts
