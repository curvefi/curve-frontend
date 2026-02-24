import { useMarketBasePrice } from '@/llamalend/queries/market-base-price.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market-oracle-price.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'

export const MarketPrices = ({ chainId, marketId }: { chainId: IChainId; marketId: string }) => {
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

  return (
    <>
      <ActionInfo
        label={t`Base price`}
        value={formatNumber(basePrice)}
        valueTooltip={basePrice && formatNumber(basePrice, { decimals: 5 })}
        loading={isLoadingBasePrice}
        error={errorBasePrice}
      />

      <ActionInfo
        label={t`Oracle price`}
        value={formatNumber(oraclePrice)}
        valueTooltip={oraclePrice && formatNumber(oraclePrice, { decimals: 5 })}
        loading={isLoadingOraclePrice}
        error={errorOraclePrice}
      />
    </>
  )
}
