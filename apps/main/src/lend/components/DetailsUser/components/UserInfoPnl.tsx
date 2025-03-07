import styled from 'styled-components'
import useStore from '@/lend/store/useStore'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils'
export const UserInfoPnl = ({ userActiveKey }: { userActiveKey: string }) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { details, error } = resp ?? {}

  if (error) return '?'

  return (
    <Pnl pnl={details?.pnl?.percentage}>
      {!details?.pnl?.percentage || !isFinite(+details.pnl.percentage)
        ? '-'
        : formatNumber(+details.pnl.percentage, { ...FORMAT_OPTIONS.PERCENT })}
    </Pnl>
  )
}

const Pnl = styled.span<{ pnl: string | undefined }>`
  color: ${({ pnl }) =>
    pnl === undefined || !isFinite(+pnl)
      ? 'inherit'
      : +pnl > 0
        ? 'var(--health_mode_healthy--color)'
        : 'var(--health_mode_hard_liquidation--color)'};
`
