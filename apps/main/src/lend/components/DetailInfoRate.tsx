import { ChainId, FutureRates } from '@/lend/types/lend.types'
import { useMarketRates } from '@/llamalend/queries/market'
import { DetailInfo } from '@ui/DetailInfo'
import { Icon } from '@ui/Icon'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber, amount } from '@ui-kit/utils'

export const DetailInfoRate = ({
  rChainId,
  marketId,
  isBorrow,
  futureRates,
}: {
  rChainId: ChainId
  marketId: string
  isBorrow: boolean
  futureRates?: FutureRates | undefined | null
}) => {
  const {
    data: marketRates,
    isLoading: marketRatesLoading,
    error: marketRatesError,
  } = useMarketRates({
    chainId: rChainId,
    marketId,
  })

  const futureRate = isBorrow ? futureRates?.borrowApr : futureRates?.lendApy
  const rate = isBorrow ? marketRates?.borrowApr : marketRates?.lendApy

  return (
    <DetailInfo
      loading={marketRatesLoading}
      loadingSkeleton={[100, 20]}
      label={isBorrow ? t`Borrow APR:` : t`Lend APY:`}
    >
      <span>
        {marketRatesError ? (
          '?'
        ) : (
          <strong>
            {formatNumber(rate, { unit: 'percentage', abbreviate: false, fallback: '-' })}
            {typeof futureRates !== 'undefined' && (
              <>
                {' '}
                <Icon name="ArrowRight" size={16} className="svg-arrow" />{' '}
                {formatNumber(amount(futureRate), { unit: 'percentage', abbreviate: false, fallback: '-' })}
              </>
            )}
          </strong>
        )}
      </span>
    </DetailInfo>
  )
}
