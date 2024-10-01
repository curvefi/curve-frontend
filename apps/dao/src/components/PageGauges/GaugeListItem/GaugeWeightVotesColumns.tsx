import styled from 'styled-components'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils/'

import Tooltip from '@/ui/Tooltip'

type GaugeWeightVotesColumnsProps = {
  userGaugeWeightVoteData: UserGaugeVoteWeight
}

const GaugeWeightVotesColumns = ({ userGaugeWeightVoteData }: GaugeWeightVotesColumnsProps) => {
  const { userPower, userVeCrv, userFutureVeCrv } = userGaugeWeightVoteData

  const hasFutureVeCrv = userFutureVeCrv > userVeCrv

  return (
    <>
      <BoxColumn>
        <GaugeData>{userPower}%</GaugeData>
      </BoxColumn>
      <BoxColumn>
        <Tooltip
          minWidth="18rem"
          tooltip={
            <p>
              {t`Updating gauge vote will update used veCRV from`} <strong>{formatNumber(userVeCrv)}</strong> {t`to`}{' '}
              <strong>{formatNumber(userFutureVeCrv)}</strong>
            </p>
          }
        >
          <GaugeData>
            {formatNumber(userVeCrv, { showDecimalIfSmallNumberOnly: true })}
            {hasFutureVeCrv && ` → ${formatNumber(userFutureVeCrv, { showDecimalIfSmallNumberOnly: true })}`}
          </GaugeData>
        </Tooltip>
      </BoxColumn>
    </>
  )
}

const BoxColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  text-align: right;
`

export default GaugeWeightVotesColumns
