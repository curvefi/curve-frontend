import { useMarketBasePrice, useMarketOraclePrice } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'

export const MarketPrices = ({ chainId, marketId }: { chainId: IChainId; marketId: string | undefined }) => {
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
        valueTooltip={basePrice != null ? formatNumber(basePrice, { decimals: 5 }) : undefined}
        loading={isLoadingBasePrice}
        error={errorBasePrice}
      />

      <ActionInfo
        label={t`Oracle price`}
        value={formatNumber(oraclePrice)}
        valueTooltip={oraclePrice != null ? formatNumber(oraclePrice, { decimals: 5 }) : undefined}
        loading={isLoadingOraclePrice}
        error={errorOraclePrice}
      />
    </>
  )
}
