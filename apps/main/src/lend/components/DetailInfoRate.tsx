import { t } from '@lingui/macro'
import React from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import useStore from '@/lend/store/useStore'

import DetailInfo from '@ui/DetailInfo'
import Icon from '@ui/Icon'
import { ChainId, FutureRates } from '@/lend/types/lend.types'

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
  const futureRate = isBorrow ? futureRates?.borrowApy : futureRates?.lendApr

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
            {formatNumber(isBorrow ? rates?.borrowApy : rates?.lendApr, {
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
