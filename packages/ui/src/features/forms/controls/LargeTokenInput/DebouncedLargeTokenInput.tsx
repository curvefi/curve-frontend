import { useCallback } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import { type MakeOptional } from '@ui/features/queries/util'
import { useDebounced } from '@ui/hooks/useDebounce'
import { LargeTokenInput, type LargeTokenInputProps } from './LargeTokenInput'

/**
 * @deprecated Use the form-level debouncing built into new forms instead. This is retained for legacy DEX forms.
 */
export const DebouncedLargeTokenInput = ({
  balance,
  onBalance: callback,
  ...props
}: MakeOptional<LargeTokenInputProps, 'onBalance'>) => {
  const onBalance = useCallback((value: Decimal | undefined) => callback?.(value), [callback])
  const setDebounced = useDebounced(onBalance)
  return <LargeTokenInput {...props} balance={balance} onBalance={setDebounced} />
}
