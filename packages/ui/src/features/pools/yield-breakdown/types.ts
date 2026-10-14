import type { Address } from '@primitives/address.utils'
import type { Amount } from '@primitives/decimal.utils'
import type { TokenInfoProps } from '@ui/components/TokenInfo'
import type { TooltipProps } from '@ui/components/Tooltip'
import type { QueryOrValue } from '@ui/features/queries/util'

export type YieldBreakdownRow = {
  source: TokenInfoProps
  address?: Address
  displayAddress?: string
  explorerUrl?: string
  price?: number
  rate?: number
  maxBoostRate?: number
  rateTooltip?: Pick<TooltipProps, 'title' | 'body' | 'clickable'>
}

export type YieldBreakdownData = {
  rows: QueryOrValue<YieldBreakdownRow[]>
  total: QueryOrValue<Amount | undefined>
  maxBoostTotal?: QueryOrValue<number>
}
