import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'

export type Hop = {
  hops: { name: string; part: number; fromTokenAddress: string; toTokenAddress: string }[][]
  part: number
}

export type BreakdownItem = { $opacity?: boolean; $isTotal?: boolean; $minWidth?: string }

export type RouteDetailsProps = BreakdownItem & {
  network: INetworkName
  loading: boolean
  swapFrom: { address: string; symbol: string } | undefined
  swapFromAmounts: { value: string | number; label: string }[]
  swapTo: { address: string; symbol: string } | undefined
  swapToAmounts: (string | number | undefined)[]
  nonSwapAmount: { value: number | string | undefined; label: string }
  total: number | string | undefined
  avgPrice: number | string | undefined
  routeImage: string | null | undefined
  type: 'collateral' | 'borrowed'
}
