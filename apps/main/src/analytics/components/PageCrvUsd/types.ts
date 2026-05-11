import type { Address } from '@primitives/address.utils'

export type DashboardTableRow = { url?: string | null }

export type MintMarketRow = DashboardTableRow & {
  market: string
  borrowedUsd: number
  collateralUsd: number
  borrowApy: number
  loans: number
  utilization: number
}

export type YieldBasisPoolRow = DashboardTableRow & {
  name: string
  address: Address
  transactionCount: number
  volume7d: number
  adjacentVolume7d: number
  totalVolume7d: number
  adjacentVolumeShare: number
}
