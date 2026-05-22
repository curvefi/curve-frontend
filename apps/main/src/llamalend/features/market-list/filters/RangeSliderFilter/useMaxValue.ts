import { get } from 'lodash'
import { useMemo } from 'react'
import type { DeepKeys } from '@tanstack/table-core'
import { maybe } from '@primitives/objects.utils'

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
    () => max ?? (data.length ? Math.ceil(Math.max(...data.map(item => get(item, field)))) : undefined),
    [max, data, field],
  )
  const step = useMemo(() => maybe(maxValue, maxValue => Math.ceil(+maxValue.toPrecision(2) / 100)), [maxValue])
  return { maxValue, step }
}
