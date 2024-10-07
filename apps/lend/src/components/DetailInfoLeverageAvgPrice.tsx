import DetailInfo from '@/ui/DetailInfo'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React from 'react'



const DetailInfoLeverageAvgPrice = ({ avgPrice, loading }: { avgPrice: string | undefined; loading: boolean }) => {
  return (
    <DetailInfo label={t`Expected avg. price:`} loading={loading} loadingSkeleton={[60, 20]}>
      <strong>{formatNumber(avgPrice, { defaultValue: '-' })}</strong>
    </DetailInfo>
  )
}

export default DetailInfoLeverageAvgPrice
