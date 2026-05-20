import type { Address } from 'viem'
import type { Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'

export type CurveSolverQuoteRequest = {
  input_token: Address
  output_token: Address
  amount_in: Decimal
  exact: boolean
  receiver?: Address
  min_out?: Decimal
  gas_price_gwei?: Decimal
}

type LlamaStatus = 'NotApplicable' | 'Ok' | 'FetchFailed' | 'ParseFailed'

type RouteDebug = {
  hops: number
  pools: string[]
  swap_addresses: Address[]
  pool_addresses: Address[]
  swap_params: [number, number, number, number, number]
  coins: [Address, Address][]
  quote_full: Decimal
  selected: boolean
}

type ExecutionSummary = { ops: number; slots_used: number; final_slots: number[] }

type OptimizationDebug = {
  method: string
  legs: LegDebug[]
  total_gas: number
}

type LegDebug = {
  route_id: number
  buckets: number
  amount: Decimal
  output: Decimal
  hops: number
  pools: string[]
  swap_addresses: Address[]
  pool_addresses: Address[]
  swap_params: [number, number, number, number, number]
}

type DebugInfo = {
  pools: string[]
  pool_addresses: Address[]
  swap_addresses: Address[]
  swap_params: number[][]
  coins: [Address, Address][]
  selected: boolean
  routes_found: number
  routes: RouteDebug[]
  optimization: OptimizationDebug
  execution_summary: ExecutionSummary
  used_balanced_withdraw: boolean
  selected_max_hops: number
  selected_total_hops: number
  exact_validated: boolean
  interpolated_output?: string
  timing_ms: number
  phase_timings_ms: number
  llamma_status?: { crvusd: LlamaStatus; lending: LlamaStatus }
}

export type CurveSolverQuoteResponse = {
  expected_out: Decimal
  quote_quality?: 'InterpolatedEstimate' | 'RouteEstimate' | 'RouterExecutionEstimate'
  gas_estimate: number
  legs: number
  ops: number
  final_slot?: number
  final_slots: number[]
  final_token: Address
  snapshot_block: number
  gas_price_gwei: number
  router_address: Address
  calldata?: Hex
  error?: string
  error_kind?: string
  debug?: DebugInfo
}
