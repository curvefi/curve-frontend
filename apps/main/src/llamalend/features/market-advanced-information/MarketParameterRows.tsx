import { useMarketOraclePrice, useMarketVaultPricePerShare } from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { fakeLoadingQ, fallbackQ, mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

type MarketPricesRowsProps = {
  chainId: IChainId
  marketId: string | undefined
  enablePricePerShare: boolean
  apiMarket: QueryProp<LlamaMarket>
}

export const MarketPricesRows = ({ chainId, marketId, enablePricePerShare, apiMarket }: MarketPricesRowsProps) => {
  const oraclePriceOnChain = useMarketOraclePrice({ chainId, marketId })
  const pricePerShare = useMarketVaultPricePerShare({ chainId, marketId }, enablePricePerShare)
  const oraclePrice = fallbackQ(
    q(oraclePriceOnChain),
    mapQuery(apiMarket, m => decimal(m.oraclePrice)),
  )
  return (
    <>
      <ActionInfo
        testId="market-price-oracle"
        label={t`Oracle price`}
        labelTooltip={{
          title: t`The price source that determines your collateral value, health, and when your position moves toward soft liquidation.`,
        }}
        value={mapQuery(oraclePrice, data => formatNumber(data, 'pool.parameter'))}
      />
      {enablePricePerShare && marketId && (
        <ActionInfo
          testId="market-price-per-share"
          label={t`Price per share`}
          value={mapQuery(pricePerShare, data => formatNumber(data, 'pool.parameter'))}
        />
      )}
    </>
  )
}

export const MarketIdRow = ({ marketId }: { marketId: string | undefined }) => (
  <ActionInfo testId="market-id" label={t`ID`} value={fakeLoadingQ(marketId)} />
)
