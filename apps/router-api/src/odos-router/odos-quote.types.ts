/**
 * Public facing path request v2 schema.
 *
 * @title PathRequestV2
 * @description Public facing path request v2 schema.
 *
 * @example
 * const request: PathRequestV2 = {
 *   chainId: 1,
 *   compact: true,
 *   gasPrice: 20,
 *   inputTokens: [
 *     {
 *       amount: "189000000",
 *       tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
 *     },
 *   ],
 *   outputTokens: [
 *     {
 *       proportion: 1,
 *       tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
 *     },
 *   ],
 *   referralCode: 0,
 *   slippageLimitPercent: 0.3,
 *   sourceBlacklist: [],
 *   sourceWhitelist: [],
 *   userAddr: "0x47E2D28169738039755586743E2dfCF3bd643f86",
 * };
 */
export interface PathRequestV2 {
  /**
   * Deprecated
   *
   * @description Optional deprecated field.
   */
  deprecated?: string | null

  /**
   * Trace ID
   *
   * @description Optional trace identifier useful for debugging / tracing.
   */
  traceId?: string | null

  /**
   * Chain ID
   *
   * @title Chainid
   * @description Chain ID to request path for.
   * @example 1
   */
  chainId: number

  /**
   * Input tokens
   *
   * @title Inputtokens
   * @description Input tokens and amounts for quote.
   *
   * @minItems 1
   * @maxItems 6
   * @example [{ "amount": "189000000", "tokenAddress": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" }]
   */
  inputTokens: TokenAmount[]

  /**
   * Output tokens
   *
   * @title Outputtokens
   * @description Output tokens and proportions for quote.
   *
   * @minItems 1
   * @maxItems 6
   * @example [{ "proportion": 1, "tokenAddress": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" }]
   */
  outputTokens: TokenProportion[]

  /**
   * Gas price
   *
   * @title Gasprice
   * @description Gas Price.
   * @example 20
   */
  gasPrice?: number | null

  /**
   * User address
   *
   * @title Useraddr
   * @description Address of wallet to use to generate transaction.
   * @default "0x47E2D28169738039755586743E2dfCF3bd643f86"
   * @example "0x47E2D28169738039755586743E2dfCF3bd643f86"
   *
   * @remarks
   * Must match the pattern: {@code ^0x([a-fA-F0-9]){40}$}
   */
  userAddr?: string | null

  /**
   * Slippage limit percent
   *
   * @title Slippagelimitpercent
   * @description Slippage to use for checking the path is valid.
   * @default 0.3
   * @example 0.3
   */
  slippageLimitPercent?: number | null

  /**
   * Source blacklist
   *
   * @title Sourceblacklist
   * @description List of liquidity providers that are not to be used for the swap path.
   * @example []
   */
  sourceBlacklist?: string[] | null

  /**
   * Source whitelist
   *
   * @title Sourcewhitelist
   * @description List of liquidity providers to exclusively use for the swap path.
   * @example []
   */
  sourceWhitelist?: string[] | null

  /**
   * Pool blacklist
   *
   * @title Poolblacklist
   * @description List of pool addresses to exclude from swap path consideration.
   * @example []
   */
  poolBlacklist?: string[] | null

  /**
   * Path visualization flag
   *
   * @title Pathviz
   * @description Whether to include path visualization metadata.
   * @default false
   * @example false
   */
  pathViz?: boolean | null

  /**
   * Path visualization image flag
   *
   * @title Pathvizimage
   * @description Whether to include a rendered image of the path visualization.
   * @default false
   */
  pathVizImage?: boolean | null

  /**
   * Path visualization image configuration
   *
   * @description Configuration object for controlling how the path visualization
   * image is rendered.
   */
  pathVizImageConfig?: PathVizImageConfig | null

  /**
   * Disable RFQs
   *
   * @title Disablerfqs
   * @description Flag to disable all off-chain RFQs from order routing.
   * @default true
   * @example true
   */
  disableRFQs?: boolean | null

  /**
   * Referral code
   *
   * @title Referralcode
   * @description Optional referral code identifier.
   * @default 0
   * @example 0
   */
  referralCode?: number | null

  /**
   * Compact response flag
   *
   * @title Compact
   * @description Whether to request a compact response representation.
   * @default true
   * @example true
   */
  compact?: boolean | null

  /**
   * Like-asset routing flag
   *
   * @title Likeasset
   * @description Whether to prioritize paths that keep assets within the same class.
   * @default false
   * @example false
   */
  likeAsset?: boolean | null

  /**
   * Simple routing flag
   *
   * @title Simple
   * @description Whether to use simplified routing logic.
   * @default false
   * @example false
   */
  simple?: boolean | null
}

/**
 * Interface from the prices API that provides access to the Odos quote endpoint.
 */
export type CurveOdosQuoteRequest = {
  chain_id: PathRequestV2['chainId']
  from_address: PathRequestV2['inputTokens'][number]['tokenAddress']
  to_address: PathRequestV2['outputTokens'][number]['tokenAddress']
  amount: PathRequestV2['inputTokens'][number]['amount']
  slippage: PathRequestV2['slippageLimitPercent']
  caller_address: PathRequestV2['userAddr']
  pathVizImage: PathRequestV2['pathVizImage']
  blacklist: PathRequestV2['poolBlacklist']
}

/**
 * Token amount
 *
 * @description Represents a token and its amount for input.
 *
 * @example
 * const token: TokenAmount = {
 *   amount: "189000000",
 *   tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
 * };
 */
interface TokenAmount {
  /**
   * Raw token amount, typically as a stringified integer (e.g. in smallest units).
   */
  amount: string

  /**
   * Token contract address.
   *
   * @remarks
   * Must match the pattern: {@code ^0x([a-fA-F0-9]){40}$}
   */
  tokenAddress: string
}

/**
 * Token proportion
 *
 * @description Represents a token and its proportion for output.
 *
 * @example
 * const token: TokenProportion = {
 *   proportion: 1,
 *   tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
 * };
 */
interface TokenProportion {
  /**
   * Proportion of the total output, typically between 0 and 1.
   */
  proportion: number

  /**
   * Token contract address.
   *
   * @remarks
   * Must match the pattern: {@code ^0x([a-fA-F0-9]){40}$}
   */
  tokenAddress: string
}

/**
 * Path visualization image configuration
 *
 * @description Configuration for how the path visualization image should be rendered.
 * The exact shape is defined in the `PathVizImageConfig` OpenAPI schema.
 */
interface PathVizImageConfig {
  /**
   * Arbitrary configuration bag. Extend this according to the actual
   * `PathVizImageConfig` schema.
   */
  [key: string]: unknown
}

/**
 * Quote response schema.
 *
 * @title QuoteResponse
 * @description Quote response schema.
 */
export interface OdosQuoteResponse {
  /**
   * Deprecated
   */
  deprecated?: string | null

  /**
   * Trace ID
   */
  traceId?: string | null

  /**
   * Input token addresses.
   *
   * @title Intokens
   */
  inTokens: string[]

  /**
   * Output token addresses.
   *
   * @title Outtokens
   */
  outTokens: string[]

  /**
   * Input token amounts as stringified integers (typically smallest units).
   *
   * @title Inamounts
   */
  inAmounts: string[]

  /**
   * Output token amounts as stringified numbers (typically smallest units).
   *
   * @title Outamounts
   */
  outAmounts: string[]

  /**
   * Gas estimate for the transaction.
   *
   * @title Gasestimate
   */
  gasEstimate: number

  /**
   * Data gas estimate for the transaction.
   *
   * @title Datagasestimate
   */
  dataGasEstimate: number

  /**
   * Gas price in gwei.
   *
   * @title Gweipergas
   */
  gweiPerGas: number

  /**
   * Total estimated gas cost in quote currency.
   *
   * @title Gasestimatevalue
   */
  gasEstimateValue: number

  /**
   * Fiat or base asset values of the inputs.
   *
   * @title Invalues
   */
  inValues: number[]

  /**
   * Fiat or base asset values of the outputs.
   *
   * @title Outvalues
   */
  outValues: number[]

  /**
   * Net output value after fees and gas.
   *
   * @title Netoutvalue
   */
  netOutValue: number

  /**
   * Price impact of the trade.
   *
   * @title Priceimpact
   */
  priceImpact?: number | null

  /**
   * Percentage difference between input and output value.
   *
   * @title Percentdiff
   */
  percentDiff: number

  /**
   * Optional Permit2 message payload.
   *
   * @title Permit2Message
   */
  permit2Message?: Record<string, unknown> | null

  /**
   * Hash of the Permit2 message.
   *
   * @title Permit2Hash
   */
  permit2Hash?: string | null

  /**
   * Partner fee percent.
   *
   * @title Partnerfeepercent
   * @default 0
   */
  partnerFeePercent?: number

  /**
   * Identifier of the path used for the quote.
   *
   * @title Pathid
   */
  pathId?: string | null

  /**
   * Path visualization metadata.
   *
   * @title Pathviz
   */
  pathViz?: Record<string, unknown> | null

  /**
   * Path visualization image (e.g. URL or base64 string).
   *
   * @title Pathvizimage
   */
  pathVizImage?: string | null

  /**
   * Block number at which the quote is valid.
   *
   * @title Blocknumber
   */
  blockNumber: number
}
