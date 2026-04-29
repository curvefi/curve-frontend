import { type Dispatch, type SetStateAction, useEffect } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import type { QueryProp } from '@ui-kit/types/util'
import { isQueryValueDifferent } from '../info-actions.helpers'

type ShowNetRateState = [Record<string, boolean>, Dispatch<SetStateAction<Record<string, boolean>>>]

export function useShouldShowNetRate({
  prevNetRate,
  prevRate,
  netRate,
  rate,
  tokenSymbol,
  defaultValue: [defaultValue, setDefaultValue],
}: {
  prevNetRate: QueryProp<Decimal | null> | undefined
  prevRate: QueryProp<Decimal | null> | undefined
  netRate: QueryProp<Decimal | null> | undefined
  rate: QueryProp<Decimal | null> | undefined
  tokenSymbol: string | undefined
  defaultValue: ShowNetRateState
}) {
  const isPrevDiff = isQueryValueDifferent(prevNetRate, prevRate?.data)
  const isDiff = isQueryValueDifferent(netRate, rate?.data)
  const result = isDiff || isPrevDiff

  useEffect(() => {
    if (result != null && tokenSymbol != null) setDefaultValue(value => ({ ...value, [tokenSymbol]: result }))
  }, [result, setDefaultValue, tokenSymbol])

  return result ?? (tokenSymbol != null ? defaultValue[tokenSymbol] : false)
}
