import React from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@ui/utils'

import DetailInfo from '@ui/DetailInfo'

const DetailInfoLeverageExpected = ({
  total,
  loading,
  swapToSymbol,
}: {
  total: string | undefined
  loading: boolean
  swapToSymbol: string | undefined
}) => (
  <DetailInfo label={t`Expected`} loading={loading} loadingSkeleton={[50, 20]}>
    <strong>
      {formatNumber(total, { defaultValue: '-' })} {swapToSymbol}
    </strong>
  </DetailInfo>
)

export default DetailInfoLeverageExpected
