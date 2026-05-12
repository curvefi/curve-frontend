import { z } from 'zod/v4'
import { address, chain, decimal, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

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
  .transform(data => ({
    stablecoin: (data.stablecoin ?? data.borrowed ?? []).map(item => ({ value: item.value, label: item.label })),
    debt: data.debt.map(item => ({ value: item.value, label: item.label })),
    collateral: data.collateral.map(item => ({ value: item.value, label: item.label })),
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
  .transform(data => ({
    address: data.address,
    borrowedIndex: data.borrowed_ix,
    borrowedSymbol: data.borrowed_symbol,
    borrowedAddress: data.borrowed_address,
    collateralIndex: data.collateral_ix,
    collateralSymbol: data.collateral_symbol,
    collateralAddress: data.collateral_address,
  }))

const oracleOHLC = z
  .object({
    time: timestampResponse,
    open: z.number(),
    close: z.number(),
    high: z.number(),
    low: z.number(),
    base_price: z.number(),
    oracle_price: z.number(),
  })
  .transform(data => ({
    time: parseTimestamp(data.time),
    open: data.open,
    close: data.close,
    high: data.high,
    low: data.low,
    basePrice: data.base_price,
    oraclePrice: data.oracle_price,
  }))

export const getOracleResponse = z
  .object({
    chain,
    controller: address,
    oracle: address,
    price_source_pools: z.array(oraclePool),
    data: z.array(oracleOHLC),
  })
  .transform(data => ({
    chain: data.chain,
    controller: data.controller,
    oracle: data.oracle,
    pools: data.price_source_pools,
    ohlc: data.data,
  }))

const liquidation = z.object({
  user: address,
  liquidator: address,
  collateral_received: z.number(),
  stablecoin_received: z.number(),
  collateral_received_usd: z.number(),
  stablecoin_received_usd: z.number(),
  debt: z.number(),
  debt_usd: z.number(),
})

const leverage = z.object({
  event_type: z.enum(['Deposit', 'Repay']),
  user: address,
  user_collateral: z.number(),
  user_borrowed: z.number(),
  user_collateral_from_borrowed: z.number(),
  debt: z.number(),
  leverage_collateral: z.number(),
  state_collateral_used: z.number(),
  borrowed_from_state_collateral: z.number(),
  user_collateral_used: z.number(),
  borrowed_from_user_collateral: z.number(),
})

const userCollateralEvent = z
  .object({
    dt: timestampResponse,
    transaction_hash: address,
    type: z.enum(['Borrow', 'Liquidate', 'Repay', 'RemoveCollateral']),
    user: address,
    collateral_change: z.number(),
    collateral_change_usd: z.number(),
    loan_change: z.number(),
    loan_change_usd: z.number(),
    liquidation: liquidation.nullable().optional(),
    leverage: leverage.nullable().optional(),
    n1: z.number(),
    n2: z.number(),
    oracle_price: z.number(),
    is_position_closed: z.boolean(),
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.dt),
    txHash: data.transaction_hash,
    type: data.type,
    user: data.user,
    collateralChange: data.collateral_change,
    collateralChangeUsd: data.collateral_change_usd,
    loanChange: data.loan_change,
    loanChangeUsd: data.loan_change_usd,
    liquidation: data.liquidation && {
      user: data.liquidation.user,
      liquidator: data.liquidation.liquidator,
      collateralReceived: data.liquidation.collateral_received,
      collateralReceivedUsd: data.liquidation.collateral_received_usd,
      stablecoinReceived: data.liquidation.stablecoin_received,
      stablecoinReceivedUsd: data.liquidation.stablecoin_received_usd,
      debt: data.liquidation.debt,
      debtUsd: data.liquidation.debt_usd,
    },
    leverage: data.leverage && {
      eventType: data.leverage.event_type,
      user: data.leverage.user,
      userCollateral: data.leverage.user_collateral,
      userBorrowed: data.leverage.user_borrowed,
      userCollateralFromBorrowed: data.leverage.user_collateral_from_borrowed,
      debt: data.leverage.debt,
      leverageCollateral: data.leverage.leverage_collateral,
      stateCollateralUsed: data.leverage.state_collateral_used,
      borrowedFromStateCollateral: data.leverage.borrowed_from_state_collateral,
      userCollateralUsed: data.leverage.user_collateral_used,
      borrowedFromUserCollateral: data.leverage.borrowed_from_user_collateral,
    },
    n1: data.n1,
    n2: data.n2,
    oraclePrice: data.oracle_price,
    isPositionClosed: data.is_position_closed,
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
  .transform(data => ({
    controller: data.controller,
    user: data.user,
    totalDeposit: data.total_deposit,
    totalBorrowed: data.total_borrowed,
    totalDepositPrecise: data.total_deposit_precise,
    totalBorrowedPrecise: data.total_borrowed_precise,
    totalDepositFromUser: data.total_deposit_from_user,
    totalDepositFromUserPrecise: data.total_deposit_from_user_precise,
    totalDepositUsdValue: data.total_deposit_usd_value,
    totalBorrowedUsdValue: data.total_deposit_from_user_usd_value,
    events: data.data,
  }))

const rateCurvePoint = z
  .object({
    utilization: z.number(),
    borrow_apy: z.number(),
    supply_apy: z.number(),
    borrow_apr: z.number(),
    supply_apr: z.number(),
  })
  .transform(data => ({
    utilization: data.utilization,
    borrowApy: data.borrow_apy,
    supplyApy: data.supply_apy,
    borrowApr: data.borrow_apr,
    supplyApr: data.supply_apr,
  }))

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
  .transform(data => ({
    rates: data.rates,
    currentUtilization: data.current_utilization,
    currentBorrowApy: data.current_borrow_apy,
    currentSupplyApy: data.current_supply_apy,
    currentBorrowApr: data.current_borrow_apr,
    currentSupplyApr: data.current_supply_apr,
  }))

export type LoanDistribution = z.infer<typeof getLoanDistributionResponse>
export type Oracle = z.infer<typeof getOracleResponse>
export type OraclePool = z.infer<typeof oraclePool>
export type OracleOHLC = z.infer<typeof oracleOHLC>
export type UserCollateralEvent = z.infer<typeof userCollateralEvent>
export type UserCollateralEvents = z.infer<typeof getUserCollateralEventsResponse>
export type RateCurvePoint = z.infer<typeof rateCurvePoint>
export type RateCurve = z.infer<typeof getRateCurveResponse>
