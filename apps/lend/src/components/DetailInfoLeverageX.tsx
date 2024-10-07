import DetailInfo from '@/ui/DetailInfo'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React from 'react'

import useStore from '@/store/useStore'


const DetailInfoLeverageX = ({
  leverage,
  maxLeverage,
  loading,
}: {
  leverage: string | undefined
  maxLeverage: string | undefined
  loading: boolean
}) => {
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  return (
    <DetailInfo label={t`Leverage:`} loading={loading} loadingSkeleton={[50, 20]}>
      <strong>{formatNumber(leverage, { maximumFractionDigits: 2, defaultValue: '-' })}x</strong>
      {isAdvanceMode && (
        <span> (max {formatNumber(maxLeverage, { maximumFractionDigits: 2, defaultValue: '-' })}x)</span>
      )}
    </DetailInfo>
  )
}

export default DetailInfoLeverageX
