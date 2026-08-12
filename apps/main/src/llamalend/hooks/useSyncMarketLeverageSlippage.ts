import { useEffect } from 'react'
import type { Decimal } from '@primitives/decimal.utils'

type SlippageForm = {
  update: (updates: { slippage: Decimal }, options?: { automated?: true }) => void
  formState: { touchedFields: { slippage?: true } }
}

export const useSyncMarketLeverageSlippage = ({ update, formState }: SlippageForm, defaultSlippage: Decimal) => {
  const isSlippageTouched = formState.touchedFields.slippage
  useEffect(() => {
    // Automated updates must not mark the field touched because touched slippage represents a user override.
    if (!isSlippageTouched) update({ slippage: defaultSlippage }, { automated: true })
  }, [defaultSlippage, isSlippageTouched, update])
}
