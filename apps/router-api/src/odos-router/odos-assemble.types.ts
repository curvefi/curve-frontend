import type { Address, Hex } from 'viem'
import type { Decimal } from '@curvefi/primitives/router'

/**
 * Assemble Path Request Schema.
 *
 * @title AssemblePathRequest
 * @description Schema for assembling a previously generated path into a transaction.
 *
 * @example
 * const req: AssemblePathRequest = {
 *   pathId: "95bb963d193cd229a0b4087f34382ea2",
 *   simulate: false,
 *   userAddr: "0x47E2D28169738039755586743E2dfCF3bd643f86",
 * };
 */
export interface AssemblePathRequest {
  /**
   * Address of the user who will execute the assembled transaction.
   *
   * @title Useraddr
   * @example "0x47E2D28169738039755586743E2dfCF3bd643f86"
   */
  userAddr: string

  /**
   * Identifier for the path to assemble.
   *
   * @title Pathid
   * @example "95bb963d193cd229a0b4087f34382ea2"
   */
  pathId: string

  /**
   * Whether to simulate the assembled transaction instead of producing calldata.
   *
   * @title Simulate
   * @default false
   * @example false
   */
  simulate?: boolean | null

  /**
   * Optional receiver address for the output tokens.
   *
   * @title Receiver
   * @example null
   */
  receiver?: string | null

  /**
   * Optional Permit2 signature to authorize token transfer.
   *
   * @title Permit2Signature
   * @example null
   */
  permit2Signature?: string | null
}

/**
 * Assembled Path Transaction Response including quote, transaction, and simulation data.
 *
 * @title PathResponse
 * @description Detailed response for an assembled path, including quote values,
 * transaction data, simulation results, and token information.
 */
export interface AssemblePathResponse {
  /**
   * Deprecated field.
   *
   * @title Deprecated
   */
  deprecated?: string | null

  /**
   * Trace identifier for debugging and correlation.
   *
   * @title Traceid
   */
  traceId?: string | null

  /**
   * Block number of the transaction quote.
   *
   * @title Blocknumber
   */
  blockNumber: number

  /**
   * Gas estimate for the transaction quote.
   *
   * @title Gasestimate
   */
  gasEstimate: number

  /**
   * Gas estimate value for the transaction quote, denominated in gwei.
   *
   * @title Gasestimatevalue
   */
  gasEstimateValue: number

  /**
   * List of input token amounts and values.
   *
   * @title Inputtokens
   */
  inputTokens: TokenAmount[]

  /**
   * List of output token amounts and values.
   *
   * @title Outputtokens
   */
  outputTokens: TokenAmount[]

  /**
   * Net output value of the transaction after all costs.
   *
   * @title Netoutvalue
   */
  netOutValue: number

  /**
   * Output values associated with the transaction quote.
   *
   * @title Outvalues
   */
  outValues: string[]

  /**
   * Assembled transaction data for the quote.
   *
   * @description Contains all necessary fields for submitting the transaction.
   */
  transaction: Transaction | null

  /**
   * Simulation output data, if simulation was enabled.
   */
  simulation: Simulation | null

  /**
   * Optional path visualization image, if requested.
   */
  pathVizImage?: string | null
}

/**
 * TokenAmount placeholder.
 *
 * Replace with the actual TokenAmount interface you already generated.
 */
interface TokenAmount {
  amount: string
  tokenAddress: string
}

/**
 * Transaction placeholder.
 */
interface Transaction {
  gas: number
  gasPrice: number
  value: Decimal
  to: Address
  from: Address
  data: Hex
  nounce: number
  chainId: number
}

/**
 * Simulation placeholder.
 *
 * Replace with the real Simulation schema if defined elsewhere.
 */
interface Simulation {
  [key: string]: unknown
}

export type CurveOdosAssembleRequest = {
  path_id: AssemblePathRequest['pathId']
  user: AssemblePathRequest['userAddr']
}
