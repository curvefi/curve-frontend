import { useMarketBasePrice, useMarketOraclePrice, useMarketVaultPricePerShare } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'

type MarketPricesRowsProps = {
  chainId: IChainId
  marketId: string | undefined
  enablePricePerShare: boolean
}

export const MarketPricesRows = ({ chainId, marketId, enablePricePerShare }: MarketPricesRowsProps) => {
  const {
    data: basePrice,
    isLoading: isLoadingBasePrice,
    error: errorBasePrice,
  } = useMarketBasePrice({ chainId, marketId })

  const {
    data: oraclePrice,
    isLoading: isLoadingOraclePrice,
    error: errorOraclePrice,
  } = useMarketOraclePrice({ chainId, marketId })

  const {
    data: pricePerShare,
    isLoading: isLoadingPricePerShare,
    error: errorPricePerShare,
  } = useMarketVaultPricePerShare({ chainId, marketId }, enablePricePerShare)

  return (
    <>
      <ActionInfo
        label={t`Base price`}
        value={formatNumber(basePrice)}
        valueTooltip={basePrice == null ? undefined : formatNumber(basePrice, { decimals: 5 })}
        loading={isLoadingBasePrice || !marketId}
        error={errorBasePrice}
      />
      <ActionInfo
        label={t`Oracle price`}
        value={formatNumber(oraclePrice)}
        valueTooltip={oraclePrice == null ? undefined : formatNumber(oraclePrice, { decimals: 5 })}
        loading={isLoadingOraclePrice || !marketId}
        error={errorOraclePrice}
      />
      {enablePricePerShare && (
        <ActionInfo
          label={t`Price per share`}
          value={formatNumber(pricePerShare, { decimals: 5 })}
          loading={isLoadingPricePerShare || !marketId}
          error={errorPricePerShare}
        />
      )}
    </>
  )
}

export const MarketIdRow = ({ marketId }: { marketId: string | undefined }) => (
  <ActionInfo label={t`ID`} value={marketId} loading={!marketId} />
)
