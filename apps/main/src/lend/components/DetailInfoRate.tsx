import { useMarketRates } from '@/lend/hooks/useMarketRates'
import { ChainId, FutureRates } from '@/lend/types/lend.types'
import DetailInfo from '@ui/DetailInfo'
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
  const { rates, loading, error } = useMarketRates(rChainId, rOwmId)

  const futureRate = isBorrow ? futureRates?.borrowApy : futureRates?.lendApr
  const rate = isBorrow ? rates?.borrowApy : rates?.lendApr

  return (
    <DetailInfo loading={loading} loadingSkeleton={[100, 20]} label={isBorrow ? t`Borrow APY:` : t`Lend APR:`}>
      <span>
        {error ? (
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
