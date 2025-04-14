import styled from 'styled-components'
import Chip from 'ui/src/Typography/Chip'
import useStore from '@/lend/store/useStore'
import Box from '@ui/Box'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const UserInfoPnl = ({ userActiveKey }: { userActiveKey: string }) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { details, error } = resp ?? {}

  if (error) return '?'

  return (
    <Pnl
      pnl={details?.pnl?.percentage}
      size="md"
      tooltip={
        !details?.pnl?.currentProfit || !isFinite(+details.pnl.currentProfit) ? null : (
          <Box flex flexColumn flexWrap="no-wrap">
            <Box grid gridTemplateColumns="140px auto" gridGap={1}>
              <RowTitle>{t`Current value:`}</RowTitle>
              <RowValue>{formatNumber(+details.pnl.currentPosition, { ...FORMAT_OPTIONS.USD })}</RowValue>
            </Box>
            <Box grid gridTemplateColumns="140px auto" gridGap={1}>
              <RowTitle>{t`Value at deposit:`}</RowTitle>
              <RowValue>{formatNumber(+details.pnl.deposited, { ...FORMAT_OPTIONS.USD })}</RowValue>
            </Box>
            <br />
            <Box grid gridTemplateColumns="140px auto" gridGap={1}>
              <RowTitle>{t`Profit:`}</RowTitle>
              <RowValue>
                {formatNumber(+details.pnl.currentProfit, { ...FORMAT_OPTIONS.USD })} (
                {formatNumber(+details.pnl.percentage, { ...FORMAT_OPTIONS.PERCENT })})
              </RowValue>
            </Box>
          </Box>
        )
      }
    >
      {!details?.pnl?.percentage || !isFinite(+details.pnl.percentage)
        ? '-'
        : formatNumber(+details.pnl.percentage, { ...FORMAT_OPTIONS.PERCENT })}
    </Pnl>
  )
}

const Pnl = styled(Chip)<{ pnl: string | undefined }>`
  color: ${({ pnl }) =>
    pnl === undefined || !isFinite(+pnl)
      ? 'inherit'
      : +pnl > 0
        ? 'var(--health_mode_healthy--color)'
        : 'var(--health_mode_hard_liquidation--color)'};
`

const RowTitle = styled.span`
  white-space: nowrap;
  font-weight: var(--bold);
`

const RowValue = styled.span`
  text-align: right;
`
