import { toDate } from '../timestamp'
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
  date: toDate(x.timestamp),
  txHash: x.transaction_hash,
})

export const parseYield = (x: Responses.GetYieldResponse['data'][number]): Models.Yield => ({
  date: toDate(x.timestamp),
  assets: x.assets,
  supply: x.supply,
  apyProjected: Number(x.proj_apy),
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
  date: toDate(x.dt),
})

export const parseStatistics = (x: Responses.GetStatisticsResponse): Models.Statistics => ({
  lastUpdated: toDate(x.last_updated),
  lastUpdatedBlock: x.last_updated_block,
  aprProjected: x.proj_apr,
  supply: x.supply,
})

export const parseUserStats = (x: Responses.GetUserStatsResponse): Models.UserStats => ({
  totalDeposited: BigInt(x.total_deposited),
  totalReceived: BigInt(x.total_recieved),
  totalWithdrawn: BigInt(x.total_withdrawn),
  totalTransferredIn: BigInt(x.total_transferred_in),
  totalTransferredOut: BigInt(x.total_transferred_out),
  currentBalance: BigInt(x.current_balance),
})
