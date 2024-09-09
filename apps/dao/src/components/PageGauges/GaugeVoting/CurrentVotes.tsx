import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import { formatNumber } from '@/ui/utils'

import { USER_VOTES_TABLE_LABELS } from './constants'

import MetricsComp, { MetricsColumnData } from '@/components/MetricsComp'
import GaugeVoteItem from './GaugeVoteItem'
import Box from '@/ui/Box'
import PaginatedTable from '@/components/PaginatedTable'

type CurrentVotesProps = {
  userAddress: string
}

const CurrentVotes = ({ userAddress }: CurrentVotesProps) => {
  const userData = useStore((state) => state.user.userGaugeVoteWeightsMapper[userAddress?.toLowerCase() ?? ''])
  const { setUserGaugeVoteWeightsSortBy, userGaugeVoteWeightsSortBy, getUserGaugeVoteWeights } = useStore(
    (state) => state.user
  )

  const tableMinWidth = 42.3125
  const gridTemplateColumns = '17.5rem 1fr 1fr 1fr'

  return (
    <Wrapper>
      <VoteStats flex flexColumn flexGap="var(--spacing-3)">
        <h3>{t`Current User Gauge Votes`}</h3>
        <Box flex flexGap="var(--spacing-4)">
          <MetricsComp
            loading={!userData || userData?.fetchingState === 'LOADING'}
            title="Power used"
            data={<MetricsColumnData>{userData?.data.powerUsed}%</MetricsColumnData>}
          />
          <MetricsComp
            loading={!userData || userData?.fetchingState === 'LOADING'}
            title="veCRV used"
            data={
              <MetricsColumnData>
                {formatNumber(userData?.data.veCrvUsed, { showDecimalIfSmallNumberOnly: true })} veCRV
              </MetricsColumnData>
            }
          />
          <MetricsComp
            loading={!userData || userData?.fetchingState === 'LOADING'}
            title="Gauge amount"
            data={<MetricsColumnData>{userData?.data.gauges.length}</MetricsColumnData>}
          />
        </Box>
      </VoteStats>
      <PaginatedTable<UserGaugeVoteWeight>
        data={userData?.data.gauges ?? []}
        minWidth={tableMinWidth}
        fetchingState={userData?.fetchingState ?? 'LOADING'}
        columns={USER_VOTES_TABLE_LABELS}
        sortBy={userGaugeVoteWeightsSortBy}
        errorMessage={t`An error occurred while fetching user gauge weight votes.`}
        noDataMessage={t`No gauge votes found`}
        setSortBy={(key) => setUserGaugeVoteWeightsSortBy(userAddress, key as UserGaugeVoteWeightsSortBy)}
        getData={() => getUserGaugeVoteWeights(userAddress)}
        renderRow={(gauge, index) => (
          <GaugeVoteItem key={index} gauge={gauge} gridTemplateColumns={gridTemplateColumns} />
        )}
        gridTemplateColumns={gridTemplateColumns}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const VoteStats = styled(Box)`
  padding: var(--spacing-3);
`

export default CurrentVotes
