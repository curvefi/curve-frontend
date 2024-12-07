import React from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'

import DetailInfo from '@/ui/DetailInfo'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const DetailInfoLeverageX = ({
  leverage,
  maxLeverage,
  loading,
}: {
  leverage: string | undefined
  maxLeverage: string | undefined
  loading: boolean
}) => {
  const { isAdvancedMode } = useUserProfileStore()

  return (
    <DetailInfo label={t`Leverage:`} loading={loading} loadingSkeleton={[50, 20]}>
      <strong>{formatNumber(leverage, { maximumFractionDigits: 2, defaultValue: '-' })}x</strong>
      {isAdvancedMode && (
        <span> (max {formatNumber(maxLeverage, { maximumFractionDigits: 2, defaultValue: '-' })}x)</span>
      )}
    </DetailInfo>
  )
}

export default DetailInfoLeverageX
