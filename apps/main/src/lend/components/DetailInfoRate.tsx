import { ChainId, FutureRates } from '@/lend/types/lend.types'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { DetailInfo } from '@ui/DetailInfo'
import Icon from '@ui/Icon'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

const DetailInfoRate = ({
  rChainId,
  rOwmId,
  isBorrow,
  futureRates,
}: {
  rChainId: ChainId
  rOwmId: string
  isBorrow: boolean
  futureRates?: FutureRates | undefined | null
}) => {
  const {
    data: marketRates,
    isLoading: marketRatesLoading,
    error: marketRatesError,
  } = useMarketRates({
    chainId: rChainId,
    marketId: rOwmId,
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
            {formatNumber(rate, {
              ...FORMAT_OPTIONS.PERCENT,
              defaultValue: '-',
            })}
            {typeof futureRates !== 'undefined' && (
              <>
                {' '}
                <Icon name="ArrowRight" size={16} className="svg-arrow" />{' '}
                {formatNumber(futureRate, { ...FORMAT_OPTIONS.PERCENT, defaultValue: '-' })}
              </>
            )}
          </strong>
        )}
      </span>
    </DetailInfo>
  )
}

export default DetailInfoRate
