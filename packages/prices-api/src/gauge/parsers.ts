import type { Chain } from '..'
import { toUTC } from '../timestamp'
import type * as Responses from './responses'
import type * as Models from './models'

export const parseGauge = (x: Responses.GetGaugeResponse): Models.Gauge => ({
  address: x.address,
  type: x.gauge_type,
  name: x.name ?? undefined,
  version: x.version ?? undefined,
  lpToken: x.lp_token ? x.lp_token : undefined,
  pool: x.pool
    ? {
        address: x.pool.address,
        name: x.pool.name,
        chain: x.pool.chain as Chain,
        tvlUsd: x.pool.tvl_usd,
        tradingVolume24h: x.pool.trading_volume_24h,
      }
    : undefined,
  tokens: (x.tokens ?? []).map((token) => ({
    symbol: token.symbol,
    address: token.address,
    precision: token.precision,
  })),
  market: x.market
    ? {
        name: x.market.name,
        chain: x.market.chain as Chain,
      }
    : undefined,
  killed: x.is_killed,
  emissions: x.emissions,
  weight: BigInt(x.gauge_weight),
  weightDelta7d: x.gauge_weight_7d_delta ? x.gauge_weight_7d_delta : undefined,
  weightDelta60d: x.gauge_weight_60d_delta ? x.gauge_weight_60d_delta : undefined,
  weightRelative: x.gauge_relative_weight,
  weightRelativeDelta7d: x.gauge_relative_weight_7d_delta ? x.gauge_relative_weight_7d_delta : undefined,
  weightRelativeDelta60d: x.gauge_relative_weight_60d_delta ? x.gauge_relative_weight_60d_delta : undefined,
  creationTx: x.creation_tx,
  creationDate: toUTC(x.creation_date),
  lastVoteTx: x.last_vote_tx ?? undefined,
  lastVoteDate: x.last_vote_date ? toUTC(x.last_vote_date) : undefined,
})

export const parseVote = (x: Responses.GetVotesResponse['votes'][number]): Models.GaugeVote => ({
  user: x.user,
  weight: x.weight,
  blockNumber: x.block_number,
  timestamp: toUTC(x.timestamp),
  tx: x.transaction,
})

export const parseWeightHistory = (x: Responses.GetWeightHistoryResponse['data'][number]): Models.WeightHistory => ({
  killed: x.is_killed,
  weight: parseFloat(x.gauge_weight),
  weightRelative: parseFloat(x.gauge_relative_weight),
  emissions: parseFloat(x.emissions),
  epoch: x.epoch,
})

export const parseDeployment = (x: Responses.GetDeploymentResponse): Models.Deployment => ({
  addressFrom: x.from_address,
  addressTo: x.to_address ?? undefined,
  calldata: x.calldata,
  calldataDecoded: x.decoded_calldata ?? undefined,
  blockNumber: x.block_number,
  timestamp: toUTC(x.dt),
})

export const parseUserGaugeVote = (x: Responses.GetUserGaugeVotesResponse['votes'][number]): Models.UserGaugeVote => ({
  gauge: x.gauge,
  gaugeName: x.gauge_name,
  weight: x.weight,
  blockNumber: x.block_number,
  timestamp: toUTC(x.timestamp),
  txHash: x.transaction,
})
