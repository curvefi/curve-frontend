import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import React from 'react'

import { HealthColorText } from '@/components/DetailsUser/styles'
import useStore from '@/store/useStore'


const CellHealthStatus = ({ userActiveKey, type }: { userActiveKey: string; type: 'status' | 'percent' }) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { details, error } = resp ?? {}

  return (
    <>
      {typeof resp === 'undefined' ? (
        '-'
      ) : error ? (
        '?'
      ) : type === 'status' ? (
        <HealthColorText colorKey={details?.status?.colorKey}>{details?.status?.label}</HealthColorText>
      ) : type === 'percent' ? (
        <HealthColorText colorKey={details?.status?.colorKey}>
          {formatNumber(details?.healthFull, FORMAT_OPTIONS.PERCENT)}
        </HealthColorText>
      ) : null}
    </>
  )
}

export default CellHealthStatus
