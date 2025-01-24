import { toUTC } from '../timestamp'
import type * as Responses from './responses'
import type * as Models from './models'

export const parseEvent = (x: Responses.GetEventsResponse['events'][number]): Models.Event => ({
  type: x.action_type,
  sender: x.sender,
  owner: x.owner,
  receiver: x.receiver ? x.receiver : undefined,
  assets: BigInt(x.assets),
  supply: BigInt(x.shares),
  blockNumber: x.block_number,
  timestamp: toUTC(x.timestamp),
  txHash: x.transaction_hash,
})

export const parseYield = (x: Responses.GetYieldResponse['data'][number]): Models.Yield => ({
  timestamp: toUTC(x.timestamp),
  assets: x.assets,
  supply: x.supply,
  apyProjected: x.proj_apy,
})

export const parseRevenue = (x: Responses.GetRevenueResponse['history'][number]): Models.Revenue => ({
  strategy: x.strategy,
  gain: BigInt(x.gain),
  loss: BigInt(x.loss),
  currentDebt: BigInt(x.current_debt),
  totalRefunds: BigInt(x.total_refunds),
  feesTotal: BigInt(x.total_fees),
  feesProtocol: BigInt(x.protocol_fees),
  txHash: x.tx_hash,
  timestamp: toUTC(x.dt),
})

export const parseStatistics = (x: Responses.GetStatisticsResponse): Models.Statistics => ({
  lastUpdated: toUTC(x.last_updated),
  lastUpdatedBlock: x.last_updated_block,
  aprProjected: x.proj_apr,
  supply: x.supply,
})
