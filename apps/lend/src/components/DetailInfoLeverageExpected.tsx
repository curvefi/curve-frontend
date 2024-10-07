import DetailInfo from '@/ui/DetailInfo'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React from 'react'



const DetailInfoLeverageExpected = ({
  total,
  loading,
  swapToSymbol,
}: {
  total: string | undefined
  loading: boolean
  swapToSymbol: string | undefined
}) => {
  return (
    <DetailInfo label={t`Expected`} loading={loading} loadingSkeleton={[50, 20]}>
      <strong>
        {formatNumber(total, { defaultValue: '-' })} {swapToSymbol}
      </strong>
    </DetailInfo>
  )
}

export default DetailInfoLeverageExpected
