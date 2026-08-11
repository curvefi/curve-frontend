import { useEffect } from 'react'
import type { Decimal } from '@primitives/decimal.utils'

type SlippageForm = {
  update: (updates: { slippage: Decimal }, options?: { automated?: true }) => void
  formState: { dirtyFields: { slippage?: true } }
}

export const useSyncMarketLeverageSlippage = ({ update, formState }: SlippageForm, defaultSlippage: Decimal) => {
  const isSlippageDirty = formState.dirtyFields.slippage
  useEffect(() => {
    // Automated updates must not mark the field dirty because dirty slippage represents a user override.
    if (!isSlippageDirty) update({ slippage: defaultSlippage }, { automated: true })
  }, [defaultSlippage, isSlippageDirty, update])
}
