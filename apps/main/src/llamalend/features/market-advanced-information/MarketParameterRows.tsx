import { useMarketOraclePrice, useMarketVaultPricePerShare } from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { fallbackQ, mapQuery, q, type QueryProp } from '@ui-kit/types/util'
import { formatNumber, decimal } from '@ui-kit/utils'

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
        value={formatNumber(oraclePrice.data, { abbreviate: false, fallback: '-' })}
        valueTooltip={formatNumber(oraclePrice.data, { decimals: 5, abbreviate: false, fallback: '-' })}
        loading={oraclePrice.isLoading}
        error={oraclePrice.error}
      />
      {enablePricePerShare && marketId && (
        <ActionInfo
          testId="market-price-per-share"
          label={t`Price per share`}
          value={formatNumber(pricePerShare.data, { decimals: 5, abbreviate: false, fallback: '-' })}
          loading={pricePerShare.isLoading}
          error={pricePerShare.error}
        />
      )}
    </>
  )
}

export const MarketIdRow = ({ marketId }: { marketId: string | undefined }) => (
  <ActionInfo testId="market-id" label={t`ID`} value={marketId} loading={!marketId} />
)
