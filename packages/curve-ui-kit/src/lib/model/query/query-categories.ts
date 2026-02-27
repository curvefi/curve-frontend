import { QUERY_TYPES } from '@ui-kit/lib/model/query/query-types'

const { user, table, marketDetail, static: staticData, form } = QUERY_TYPES

/**
 * Category → timing settings mapping.
 * Format: 'app.feature' for app-specific queries, 'global.feature' for shared queries.
 * Individual query authors should not need to tweak timing — pick the closest category instead.
 */
export const QUERY_CATEGORIES = {
  // Global / shared queries
  'global.gasInfo': marketDetail,
  'global.tokenRate': marketDetail,
  'global.campaigns': table,
  'global.integrations': staticData,
  'global.routerApi': form,
  'global.snapshots': table,

  // Bridge
  'bridge.capacity': marketDetail,
  'bridge.cost': marketDetail,
  'bridge.user': user,

  // DEX
  'dex.appStats': marketDetail,
  'dex.pools': table,
  'dex.pool': marketDetail,
  'dex.poolParams': staticData,
  'dex.gauge': marketDetail,
  'dex.network': staticData,
  'dex.user': user,
  'dex.swap': form,
  'dex.deployGauge': form,

  // LlamaLend / crvUSD lending
  'llamalend.appStats': marketDetail,
  'llamalend.marketList': table,
  'llamalend.market': marketDetail,
  'llamalend.marketParams': staticData,
  'llamalend.user': user,
  'llamalend.createLoan': form,
  'llamalend.repay': form,
  'llamalend.borrowMore': form,
  'llamalend.addCollateral': form,
  'llamalend.removeCollateral': form,
  'llamalend.supply': form,
  'llamalend.closeLoan': form,

  // DAO
  'dao.proposals': table,
  'dao.stats': marketDetail,
  'dao.gauges': table,
  'dao.user': user,

  // Savings (scrvUSD)
  'savings.stats': marketDetail,
  'savings.user': user,
} as const

export type QueryCategory = keyof typeof QUERY_CATEGORIES
