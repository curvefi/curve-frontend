import React from 'react'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import useStore from '@/lend/store/useStore'
import styled from 'styled-components'
import { HeathColorKey } from '@/lend/types/lend.types'

const HealthColorText = styled.span<{ colorKey?: HeathColorKey }>`
  color: ${({ colorKey }) => `var(--health_mode_${colorKey}--color)`};
`

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
