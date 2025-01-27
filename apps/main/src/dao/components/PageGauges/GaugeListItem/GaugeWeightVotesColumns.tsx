import React from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import { formatNumber } from '@ui/utils/'
import { calculateStaleVeCrvPercentage } from './utils'
import useStore from '@/dao/store/useStore'

import Tooltip from '@ui/Tooltip'
import Box from '@ui/Box'
import { UserGaugeVoteWeight } from '@/dao/types/dao.types'

type GaugeWeightVotesColumnsProps = {
  userGaugeWeightVoteData: UserGaugeVoteWeight
}

const GaugeWeightVotesColumns = ({ userGaugeWeightVoteData }: GaugeWeightVotesColumnsProps) => {
  const { userPower, userVeCrv, userFutureVeCrv } = userGaugeWeightVoteData
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

export default GaugeWeightVotesColumns
