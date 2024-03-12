import { t } from '@lingui/macro'
import React from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import DetailInfo from '@/ui/DetailInfo'
import Icon from '@/ui/Icon'

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
  const ratesResp = useStore((state) => state.markets.ratesMapper[rChainId]?.[rOwmId])

  const { rates, error } = ratesResp ?? {}
  const futureRate = isBorrow ? futureRates?.borrowApy : futureRates?.lendApy

  return (
    <DetailInfo
      loading={typeof ratesResp === 'undefined'}
      loadingSkeleton={[100, 20]}
      label={isBorrow ? t`Borrow APY:` : t`Lend APY:`}
    >
      <span>
        {error ? (
          '?'
        ) : (
          <strong>
            {formatNumber(isBorrow ? rates?.borrowApy : rates?.lendApy, {
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
