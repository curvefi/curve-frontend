import { useMemo } from 'react'
import { useMarketOnChainRates } from '@/lend/entities/market-onchain-rate'
import useStore from '@/lend/store/useStore'
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
  // uses onchain data if available
  const { data: onChainData } = useMarketOnChainRates({ chainId: rChainId, marketId: rOwmId })
  const ratesResp = useStore((state) => state.markets.ratesMapper[rChainId]?.[rOwmId])

  const { rates, error } = ratesResp ?? {}
  const futureRate = isBorrow ? futureRates?.borrowApy : futureRates?.lendApr

  const rate = useMemo(() => {
    if (isBorrow) {
      // use on chain rate if available, fall back on api rate
      return onChainData?.rates?.borrowApy ?? rates?.borrowApy
    }
    // use on chain rate if available, fall back on api rate
    return onChainData?.rates?.lendApr ?? rates?.lendApr
  }, [isBorrow, onChainData?.rates, rates?.borrowApy, rates?.lendApr])

  return (
    <DetailInfo
      loading={typeof ratesResp === 'undefined'}
      loadingSkeleton={[100, 20]}
      label={isBorrow ? t`Borrow APY:` : t`Lend APR:`}
    >
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
