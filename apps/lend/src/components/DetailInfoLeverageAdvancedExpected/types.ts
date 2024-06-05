export type Hop = {
  hops: { name: string; part: number; fromTokenAddress: string; toTokenAddress: string }[][]
  part: number
}

export type Route = {
  swapFrom: string
  swapTo: string
  data: Hop[]
}

export type BreakdownItem = { $opacity?: boolean; $isTotal?: boolean; $minWidth?: string }

export type DetailInfoLeverageExpectedProps = BreakdownItem & {
  rChainId: ChainId
  loading: boolean
  swapFrom: { address: string; symbol: string } | undefined
  swapFromAmounts: { value: string; label: string }[]
  swapTo: { address: string; symbol: string } | undefined
  swapToAmounts: (string | undefined)[]
  nonSwapAmount: { value: string | undefined; label: string }
  total: string | undefined
  avgPrice: string | undefined
  routes: Routes | null
  type: 'collateral' | 'borrowed'
}
