import styled from 'styled-components'

import { formatNumber } from '@/ui/utils/'

type GaugeWeightVotesColumnsProps = {
  userGaugeWeightVoteData: UserGaugeVoteWeight
}

const GaugeWeightVotesColumns = ({ userGaugeWeightVoteData }: GaugeWeightVotesColumnsProps) => {
  return (
    <>
      <BoxColumn>
        <GaugeData>{userGaugeWeightVoteData.userPower}%</GaugeData>
      </BoxColumn>
      <BoxColumn>
        <GaugeData>{formatNumber(userGaugeWeightVoteData.userVeCrv, { showDecimalIfSmallNumberOnly: true })}</GaugeData>
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
  font-weight: var(--bold);
  text-align: right;
`

export default GaugeWeightVotesColumns
