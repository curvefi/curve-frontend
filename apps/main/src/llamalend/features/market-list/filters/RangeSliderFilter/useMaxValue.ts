import lodash from 'lodash'
import { useMemo } from 'react'
import type { DeepKeys } from '@tanstack/table-core'

export const useMaxValue = <TKey>({
  max,
  data,
  field,
}: {
  /** Optional override for the maximum value. */
  max: number | undefined
  /** The array of data items to calculate max value from if max is not provided. */
  data: TKey[]
  /** The nested field path in the data object to filter on. */
  field: DeepKeys<TKey>
}) => {
  const maxValue = useMemo(
    // todo: round this to a nice number
    () => max ?? Math.ceil(data.reduce((acc, item) => Math.max(acc, lodash.get(item, field) as number), 0)),
    [max, data, field],
  )
  const step = useMemo(() => Math.ceil(+maxValue.toPrecision(2) / 100), [maxValue])
  return { maxValue, step }
}
