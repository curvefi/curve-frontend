import { styled } from 'styled-components'
import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import { HealthColorKey } from '@/lend/types/lend.types'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

const HealthColorText = styled.span<{ colorKey?: HealthColorKey }>`
  color: ${({ colorKey }) => `var(--health_mode_${colorKey}--color)`};
`

const CellHealthStatus = ({ userActiveKey, type }: { userActiveKey: string; type: 'status' | 'percent' }) => {
  const { error, ...details } = useUserLoanDetails(userActiveKey)

  return (
    <>
      {Object.keys(details).length === 0 ? (
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
