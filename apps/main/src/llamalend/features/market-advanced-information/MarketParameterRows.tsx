import { useMarketOraclePrice, useMarketVaultPricePerShare } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { formatNumber, amount } from '@ui-kit/utils'

type MarketPricesRowsProps = {
  chainId: IChainId
  marketId: string | undefined
  enablePricePerShare: boolean
}

export const MarketPricesRows = ({ chainId, marketId, enablePricePerShare }: MarketPricesRowsProps) => {
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
        label={t`Oracle price`}
        labelTooltip={{
          title: t`The price source that determines your collateral value, health, and when your position moves toward soft liquidation.`,
        }}
        value={formatNumber(oraclePrice, { abbreviate: false, fallback: '-' })}
        valueTooltip={formatNumber(oraclePrice, { decimals: 5, abbreviate: false, fallback: '-' })}
        loading={isLoadingOraclePrice || !marketId}
        error={errorOraclePrice}
      />
      {enablePricePerShare && (
        <ActionInfo
          label={t`Price per share`}
          value={formatNumber(amount(pricePerShare), { decimals: 5, abbreviate: false, fallback: '-' })}
          loading={isLoadingPricePerShare || !marketId}
          error={errorPricePerShare}
        />
      )}
    </>
  )
}
