import { z } from 'zod/v4'
import { address, camelizeKeys, chain, decimal, timestamp } from '../schemas'

export const endpoint = z.enum(['crvusd', 'lending'])
export type Endpoint = z.infer<typeof endpoint>

const bar = z.object({
  value: z.number(),
  label: z.string(),
})

export const getLoanDistributionResponse = z
  .object({
    stablecoin: z.array(bar).optional(),
    borrowed: z.array(bar).optional(),
    debt: z.array(bar),
    collateral: z.array(bar),
  })
  .transform(({ stablecoin, borrowed, ...data }) => ({
    ...data,
    stablecoin: stablecoin ?? borrowed ?? [],
  }))

const oraclePool = z
  .object({
    address,
    borrowed_ix: z.number(),
    borrowed_symbol: z.string(),
    borrowed_address: address,
    collateral_ix: z.number(),
    collateral_symbol: z.string(),
    collateral_address: address,
  })
  .transform(camelizeKeys)
  .transform(({ borrowedIx, collateralIx, ...data }) => ({
    ...data,
    borrowedIndex: borrowedIx,
    collateralIndex: collateralIx,
  }))

const oracleOHLC = z
  .object({
    time: timestamp,
    open: z.number().nullable().optional(),
    close: z.number().nullable().optional(),
    high: z.number().nullable().optional(),
    low: z.number().nullable().optional(),
    base_price: z.number().nullable().optional(),
    oracle_price: z.number().nullable().optional(),
  })
  .transform(camelizeKeys)

type RawOracleOHLC = z.infer<typeof oracleOHLC>
type CompleteOracleOHLC = RawOracleOHLC & {
  close: number
  high: number
  low: number
  open: number
}

const isCompleteOracleOHLC = (data: RawOracleOHLC): data is CompleteOracleOHLC =>
  data.close != null && data.high != null && data.low != null && data.open != null

export const getOracleResponse = z
  .object({
    chain,
    controller: address,
    oracle: address,
    price_source_pools: z.array(oraclePool),
    data: z.array(oracleOHLC),
  })
  .transform(camelizeKeys)
  .transform(({ data, priceSourcePools, ...oracle }) => {
    const ohlc = data.filter(isCompleteOracleOHLC)
    return { ...oracle, priceSourcePools, data: ohlc, pools: priceSourcePools, ohlc }
  })

const liquidation = z
  .object({
    user: address,
    liquidator: address,
    collateral_received: z.number(),
    stablecoin_received: z.number(),
    collateral_received_usd: z.number(),
    stablecoin_received_usd: z.number(),
    debt: z.number(),
    debt_usd: z.number(),
  })
  .transform(camelizeKeys)

const leverage = z
  .object({
    event_type: z.enum(['Deposit', 'Repay']),
    user: address,
    user_collateral: z.number(),
    user_borrowed: z.number(),
    user_collateral_from_borrowed: z.number().nullable(),
    debt: z.number().nullable(),
    leverage_collateral: z.number().nullable(),
    state_collateral_used: z.number().nullable(),
    borrowed_from_state_collateral: z.number().nullable(),
    user_collateral_used: z.number().nullable(),
    borrowed_from_user_collateral: z.number().nullable(),
  })
  .transform(camelizeKeys)

const userCollateralEvent = z
  .object({
    dt: timestamp,
    transaction_hash: address,
    type: z.enum(['Borrow', 'Liquidate', 'Repay', 'RemoveCollateral']),
    user: address,
    collateral_change: z.number(),
    collateral_change_usd: z.number().nullable(),
    loan_change: z
      .number()
      .nullable()
      .transform(value => value ?? 0),
    loan_change_usd: z.number().nullable(),
    liquidation: liquidation.nullable().optional(),
    leverage: leverage.nullable().optional(),
    n1: z.number(),
    n2: z.number(),
    oracle_price: z.number(),
    is_position_closed: z.boolean(),
  })
  .transform(camelizeKeys)
  .transform(({ dt, transactionHash, collateralChangeUsd, loanChangeUsd, ...data }) => ({
    ...data,
    timestamp: dt,
    txHash: transactionHash,
    collateralChangeUsd: collateralChangeUsd ?? undefined,
    loanChangeUsd: loanChangeUsd ?? undefined,
  }))

export const getUserCollateralEventsResponse = z
  .object({
    chain: z.string(),
    controller: address,
    user: address,
    total_deposit: z.number(),
    total_deposit_from_user: z.number(),
    total_borrowed: z.number(),
    total_deposit_precise: decimal,
    total_borrowed_precise: decimal,
    total_deposit_from_user_precise: decimal,
    total_deposit_from_user_usd_value: z.number(),
    total_deposit_usd_value: z.number(),
    count: z.number(),
    pagination: z.number().nullable(),
    page: z.number().nullable(),
    data: z.array(userCollateralEvent),
  })
  .transform(camelizeKeys)
  .transform(
    ({
      chain: _chain,
      count: _count,
      data: events,
      page: _page,
      pagination: _pagination,
      totalDepositFromUserUsdValue,
      ...data
    }) => ({ ...data, totalBorrowedUsdValue: totalDepositFromUserUsdValue, events }),
  )

const rateCurvePoint = z
  .object({
    utilization: z.number(),
    borrow_apy: z.number(),
    supply_apy: z.number(),
    borrow_apr: z.number(),
    supply_apr: z.number(),
  })
  .transform(camelizeKeys)

export const getRateCurveResponse = z
  .object({
    chain: z.string(),
    rates: z.array(rateCurvePoint),
    current_utilization: z.number().nullable(),
    current_borrow_apy: z.number().nullable(),
    current_supply_apy: z.number().nullable(),
    current_borrow_apr: z.number().nullable(),
    current_supply_apr: z.number().nullable(),
  })
  .transform(camelizeKeys)
  .transform(({ chain: _chain, ...data }) => data)

export type LoanDistribution = z.infer<typeof getLoanDistributionResponse>
export type Oracle = z.infer<typeof getOracleResponse>
export type OraclePool = z.infer<typeof oraclePool>
export type OracleOHLC = CompleteOracleOHLC
export type UserCollateralEvent = z.infer<typeof userCollateralEvent>
export type UserCollateralEvents = z.infer<typeof getUserCollateralEventsResponse>
export type RateCurvePoint = z.infer<typeof rateCurvePoint>
export type RateCurve = z.infer<typeof getRateCurveResponse>
