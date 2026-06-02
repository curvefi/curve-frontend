import { styled } from 'styled-components'
import { useStore } from '@/dao/store/useStore'
import { UserGaugeVoteWeight } from '@/dao/types/dao.types'
import { Box } from '@ui/Box'
import { TooltipButton as Tooltip } from '@ui/Tooltip/TooltipButton'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber } from '@ui-kit/utils'

type GaugeWeightVotesColumnsProps = {
  userGaugeWeightVoteData: UserGaugeVoteWeight
}

const calculateStaleVeCrvPercentage = (usedVeCrv: number, futureVeCrv: number) =>
  ((futureVeCrv - usedVeCrv) / usedVeCrv) * 100

export const GaugeWeightVotesColumns = ({ userGaugeWeightVoteData }: GaugeWeightVotesColumnsProps) => {
  const { userPower, userVeCrv, userFutureVeCrv } = userGaugeWeightVoteData
  const userGaugeVoteWeightsSortBy = useStore(state => state.user.userGaugeVoteWeightsSortBy)

  const hasFutureVeCrv = userFutureVeCrv > userVeCrv
  const staleVeCrvPct = calculateStaleVeCrvPercentage(userVeCrv, userFutureVeCrv)

  return (
    <>
      <BoxColumn>
        <GaugeData className={userGaugeVoteWeightsSortBy.key === 'userPower' ? 'bold' : ''}>{userPower}%</GaugeData>
      </BoxColumn>
      <BoxColumn>
        <Box flex flexAlignItems="center">
          <Tooltip
            minWidth="18rem"
            tooltip={
              <p>
                {t`Updating gauge vote will update used veCRV from`}{' '}
                <strong>
                  {formatNumber(userVeCrv, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    abbreviate: false,
                  })}
                </strong>{' '}
                {t`to`}{' '}
                <strong>
                  {formatNumber(userFutureVeCrv, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    abbreviate: false,
                  })}
                </strong>
                {` (${formatNumber(staleVeCrvPct, { unit: 'percentage', abbreviate: false })} increase)`}
              </p>
            }
          >
            <GaugeData className={userGaugeVoteWeightsSortBy.key === 'userVeCrv' ? 'bold' : ''}>
              {formatNumber(userVeCrv, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                abbreviate: false,
              })}
              {hasFutureVeCrv &&
                ` → ${formatNumber(userFutureVeCrv, { minimumFractionDigits: 2, maximumFractionDigits: 2, abbreviate: false })}`}
            </GaugeData>
          </Tooltip>
        </Box>
      </BoxColumn>
    </>
  )
}

const BoxColumn = styled.div`
  display: flex;
  gap: var(--spacing-1);
  padding: 0 var(--spacing-2);
  margin: auto 0 auto auto;
  &:first-child {
    margin-left: var(--spacing-2);
  }
  &:last-child {
    margin-right: var(--spacing-2);
  }
`

const GaugeData = styled.p`
  font-size: var(--font-size-2);
  display: flex;
  &.bold {
    font-weight: var(--bold);
  }
`
