import React from 'react'
import styled from 'styled-components'

import { FORMAT_OPTIONS, breakpoints, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { HealthColorText } from '@/components/DetailsUser/styles'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'

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

const StyledIconTooltip = styled(IconTooltip)`
  min-width: 0;

  @media (min-width: ${breakpoints.xs}rem) {
    min-width: auto;
  }
`

export default CellHealthStatus
