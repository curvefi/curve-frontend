import type * as Responses from './responses'
import type * as Models from './models'
import { toDate } from '../timestamp'

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
    open: ohlc.open,
    close: ohlc.close,
    high: ohlc.high,
    low: ohlc.low,
    basePrice: ohlc.base_price,
    oraclePrice: ohlc.oracle_price,
  })),
})
