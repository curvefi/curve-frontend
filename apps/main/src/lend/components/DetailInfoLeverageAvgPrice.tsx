import React from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@ui/utils'

import DetailInfo from '@ui/DetailInfo'

const DetailInfoLeverageAvgPrice = ({ avgPrice, loading }: { avgPrice: string | undefined; loading: boolean }) => (
  <DetailInfo label={t`Expected avg. price:`} loading={loading} loadingSkeleton={[60, 20]}>
    <strong>{formatNumber(avgPrice, { defaultValue: '-' })}</strong>
  </DetailInfo>
)

export default DetailInfoLeverageAvgPrice
