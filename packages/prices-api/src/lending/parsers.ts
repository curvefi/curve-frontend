import { toDate } from '../timestamp'
import type * as Models from './models'
import type * as Responses from './responses'

export const parseLoanDistribution = (x: Responses.GetLoanDistributionResponse): Models.LoanDistribution => ({
  stablecoin: x.stablecoin.map((x) => ({ value: x.value, label: x.label })),
  debt: x.debt.map((x) => ({ value: x.value, label: x.label })),
  collateral: x.collateral.map((x) => ({ value: x.value, label: x.label })),
})

export const parseOracle = (x: Responses.GetOracleResponse): Models.Oracle => ({
  chain: x.chain,
  controller: x.controller,
  oracle: x.oracle,
  pools: x.oracle_pools.map((pool) => ({
    address: pool.address,
    borrowedIndex: pool.borrowed_ix,
    borrowedSymbol: pool.borrowed_symbol,
    borrowedAddress: pool.borrowed_address,
    collateralIndex: pool.collateral_ix,
    collateralSymbol: pool.collateral_symbol,
    collateralAddress: pool.collateral_address,
  })),
  ohlc: x.data.map((ohlc) => ({
    time: toDate(ohlc.time),
    open: ohlc.open ?? null,
    close: ohlc.close ?? null,
    high: ohlc.high ?? null,
    low: ohlc.low ?? null,
    basePrice: ohlc.base_price ?? null,
    oraclePrice: ohlc.oracle_price ?? null,
  })),
})

export const parseUserCollateralEvents = (
  x: Responses.GetUserCollateralEventsResponse,
): Models.UserCollateralEvents => ({
  controller: x.controller,
  user: x.user,
  totalDeposit: x.total_deposit,
  totalBorrowed: x.total_borrowed,
  totalDepositPrecise: x.total_deposit_precise,
  totalBorrowedPrecise: x.total_borrowed_precise,
  totalDepositFromUser: x.total_deposit_from_user,
  totalDepositFromUserPrecise: x.total_deposit_from_user_precise,
  totalDepositUsdValue: x.total_deposit_usd_value,
  totalBorrowedUsdValue: x.total_deposit_from_user_usd_value,
  events: x.data.map((y) => ({
    timestamp: toDate(y.dt),
    txHash: y.transaction_hash,
    type: y.type,
    user: y.user,
    collateralChange: y.collateral_change,
    collateralChangeUsd: y.collateral_change_usd,
    loanChange: y.loan_change,
    loanChangeUsd: y.loan_change_usd,
    liquidation: y.liquidation && {
      user: y.liquidation.user,
      liquidator: y.liquidation.liquidator,
      collateralReceived: y.liquidation.collateral_received,
      collateralReceivedUsd: y.liquidation.collateral_received_usd,
      stablecoinReceived: y.liquidation.stablecoin_received,
      stablecoinRecievedUsd: y.liquidation.stablecoin_received_usd,
      debt: y.liquidation.debt,
      debtUsd: y.liquidation.debt_usd,
    },
    leverage: y.leverage && {
      eventType: y.leverage.event_type,
      user: y.leverage.user,
      userCollateral: y.leverage.user_collateral,
      userBorrowed: y.leverage.user_borrowed,
      userCollateralFromBorrowed: y.leverage.user_collateral_from_borrowed,
      debt: y.leverage.debt,
      leverageCollateral: y.leverage.leverage_collateral,
      stateCollateralUsed: y.leverage.state_collateral_used,
      borrowedFromStateCollateral: y.leverage.borrowed_from_state_collateral,
      userCollateralUsed: y.leverage.user_collateral_used,
      borrowedFromUserCollateral: y.leverage.borrowed_from_user_collateral,
    },
    n1: y.n1,
    n2: y.n2,
    oraclePrice: y.oracle_price,
  })),
})
