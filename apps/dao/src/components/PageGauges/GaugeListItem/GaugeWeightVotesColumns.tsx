import React from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils/'
import { calculateStaleVeCrvPercentage } from './utils'
import useStore from '@/store/useStore'

import Tooltip from '@/ui/Tooltip'
import Icon from '@/ui/Icon'
import Box from '@/ui/Box'

type GaugeWeightVotesColumnsProps = {
  userGaugeWeightVoteData: UserGaugeVoteWeight
}

const GaugeWeightVotesColumns = ({ userGaugeWeightVoteData }: GaugeWeightVotesColumnsProps) => {
  const { userPower, userVeCrv, userFutureVeCrv, needsUpdate } = userGaugeWeightVoteData
  const { userGaugeVoteWeightsSortBy } = useStore((state) => state.user)

  const hasFutureVeCrv = userFutureVeCrv > userVeCrv

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
                {needsUpdate && (
                  <>
                    {t`You have more veCRV to use! Update gauge to use it.`}
                    <br />
                    <br />
                  </>
                )}
                {t`Updating gauge vote will update used veCRV from`}{' '}
                <strong>
                  {formatNumber(userVeCrv, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>{' '}
                {t`to`}{' '}
                <strong>
                  {formatNumber(userFutureVeCrv, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
                {` (${calculateStaleVeCrvPercentage(userVeCrv, userFutureVeCrv).toFixed(2)}% increase)`}
              </p>
            }
          >
            <GaugeData className={userGaugeVoteWeightsSortBy.key === 'userVeCrv' ? 'bold' : ''}>
              {formatNumber(userVeCrv, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {hasFutureVeCrv &&
                ` → ${formatNumber(userFutureVeCrv, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
            </GaugeData>
            {needsUpdate && <StyledIcon name="WarningSquareFilled" size={16} />}
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

const StyledIcon = styled(Icon)`
  margin-left: var(--spacing-1);
  color: var(--danger-400);
`

export default GaugeWeightVotesColumns
