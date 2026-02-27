import { useMarketVaultPricePerShare } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { MarketPrices } from './MarketPrices'

type MarketPricesRowsProps = {
  chainId: IChainId
  marketId: string | undefined
  enablePricePerShare: boolean
}

export const MarketPricesRows = ({ chainId, marketId, enablePricePerShare }: MarketPricesRowsProps) => {
  const {
    data: pricePerShare,
    isLoading: isLoadingPricePerShare,
    error: errorPricePerShare,
  } = useMarketVaultPricePerShare({ chainId, marketId }, enablePricePerShare)

  return (
    <>
      <MarketPrices chainId={chainId} marketId={marketId} />
      {enablePricePerShare && (
        <ActionInfo
          label={t`Price per share`}
          value={formatNumber(pricePerShare, { decimals: 5 })}
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
