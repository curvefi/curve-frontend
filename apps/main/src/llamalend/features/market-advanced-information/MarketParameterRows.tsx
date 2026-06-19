import { useMarketOraclePrice, useMarketVaultPricePerShare } from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { QueryProp } from '@ui-kit/types/util'
import { formatNumber, amount } from '@ui-kit/utils'

type MarketPricesRowsProps = {
  chainId: IChainId
  marketId: string | undefined
  enablePricePerShare: boolean
  apiMarket: QueryProp<LlamaMarket>
}

export const MarketPricesRows = ({ chainId, marketId, enablePricePerShare, apiMarket }: MarketPricesRowsProps) => {
  const {
    data: oraclePrice,
    isLoading: isLoadingOraclePrice,
    error: errorOraclePrice,
  } = useMarketOraclePrice({ chainId, marketId }, !!marketId)

  const {
    data: pricePerShare,
    isLoading: isLoadingPricePerShare,
    error: errorPricePerShare,
  } = useMarketVaultPricePerShare({ chainId, marketId }, enablePricePerShare && !!marketId)
  const displayedOraclePrice = oraclePrice ?? apiMarket.data?.oraclePrice
  const oraclePriceLoading = marketId ? isLoadingOraclePrice : apiMarket.isLoading

  return (
    <>
      <ActionInfo
        label={t`Oracle price`}
        value={formatNumber(displayedOraclePrice, { abbreviate: false, fallback: '-' })}
        valueTooltip={formatNumber(displayedOraclePrice, { decimals: 5, abbreviate: false, fallback: '-' })}
        loading={oraclePriceLoading}
        error={errorOraclePrice}
      />
      {enablePricePerShare && marketId && (
        <ActionInfo
          label={t`Price per share`}
          value={formatNumber(amount(pricePerShare), { decimals: 5, abbreviate: false, fallback: '-' })}
          loading={isLoadingPricePerShare}
          error={errorPricePerShare}
        />
      )}
    </>
  )
}

export const MarketIdRow = ({ marketId }: { marketId: string | undefined }) => (
  <ActionInfo label={t`ID`} value={marketId} loading={!marketId} />
)
