import React from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import useStore from '@/lend/store/useStore'

import { HealthColorText } from '@/lend/components/DetailsUser/styles'

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
