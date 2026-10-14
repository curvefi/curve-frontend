import type { Address } from '@primitives/address.utils'
import type { TokenInfoProps } from '@ui/components/TokenInfo'
import type { TooltipProps } from '@ui/components/Tooltip'

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

export type YieldBreakdownData = { rows: YieldBreakdownRow[]; total: number; maxBoostTotal: number }
