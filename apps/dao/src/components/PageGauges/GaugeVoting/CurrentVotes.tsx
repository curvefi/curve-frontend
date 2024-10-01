import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import { formatNumber, shortenTokenAddress } from '@/ui/utils'
import networks from '@/networks'

import { USER_VOTES_TABLE_LABELS } from './constants'

import MetricsComp, { MetricsColumnData } from '@/components/MetricsComp'
import GaugeListItem from '@/components/PageGauges/GaugeListItem'
import Box from '@/ui/Box'
import PaginatedTable from '@/components/PaginatedTable'
import InternalLink from '@/ui/Link/InternalLink'
import ComboBoxSelectGauge from '@/components/ComboBoxSelectGauge'
import VoteGauge from './VoteGauge'

type CurrentVotesProps = {
  userAddress: string | undefined
}

const CurrentVotes = ({ userAddress }: CurrentVotesProps) => {
  const { userEns, userVeCrv } = useStore((state) => state.user)
  const userData = useStore((state) => state.user.userGaugeVoteWeightsMapper[userAddress?.toLowerCase() ?? ''])
  const { setUserGaugeVoteWeightsSortBy, userGaugeVoteWeightsSortBy, getUserGaugeVoteWeights } = useStore(
    (state) => state.user
  )
  const { gaugeMapper, selectedGauge, gaugesLoading } = useStore((state) => state.gauges)

  const userGauges = userData?.data.gauges ?? []
  const userWeightsLoading = !userData || userData?.fetchingState === 'LOADING'
  const gaugeMapperLoading = gaugesLoading === 'LOADING'
  const tableLoading = userWeightsLoading || gaugeMapperLoading

  const tableMinWidth = 42.3125
  const gridTemplateColumns = '17.5rem 1fr 1fr 1fr'

  const formattedSelectedGauge: UserGaugeVoteWeight = {
    title: selectedGauge?.title ?? '',
    userPower: 0,
    userVeCrv: 0,
    expired: false,
    gaugeAddress: selectedGauge?.address.toLowerCase() ?? '',
    isKilled: selectedGauge?.is_killed ?? false,
    lpTokenAddress: selectedGauge?.lp_token ?? '',
    network: selectedGauge?.pool?.chain ?? selectedGauge?.market?.chain ?? '',
    poolAddress: selectedGauge?.pool?.address ?? '',
    poolName: selectedGauge?.pool?.name ?? selectedGauge?.market?.name ?? '',
    poolUrl: '', // not available from prices
    relativeWeight: selectedGauge?.gauge_relative_weight ?? 0,
    totalVeCrv: 0,
    userFutureVeCrv: 0,
    nextVoteTime: {
      fetchingState: null,
      timestamp: null,
    },
  }

  return (
    <Wrapper>
      <VoteStats selectedGauge={selectedGauge}>
        <h3>{t`USER GAUGE VOTES`}</h3>
        {userAddress && (
          <Box flex flexGap="var(--spacing-4)" flexAlignItems="end">
            <MetricsComp
              loading={userWeightsLoading}
              title="User"
              data={
                <StyledInternalLink href={`/ethereum/user/${userAddress}`}>
                  <MetricsColumnData>{userEns ?? shortenTokenAddress(userAddress)}</MetricsColumnData>
                </StyledInternalLink>
              }
            />
            <MetricsComp
              loading={userWeightsLoading}
              title="veCRV"
              data={
                <MetricsColumnData>
                  {formatNumber(userVeCrv.veCrv, { showDecimalIfSmallNumberOnly: true })}
                </MetricsColumnData>
              }
            />
            <MetricsComp
              loading={userWeightsLoading}
              title="veCRV used"
              data={
                <MetricsColumnData>
                  {formatNumber(userData?.data.veCrvUsed, { showDecimalIfSmallNumberOnly: true })}
                </MetricsColumnData>
              }
            />
            <MetricsComp
              loading={userWeightsLoading}
              title="Power used"
              data={<MetricsColumnData>{userData?.data.powerUsed}%</MetricsColumnData>}
            />
            <Box margin="0 0 0 auto">
              <ComboBoxSelectGauge title={''} />
            </Box>
          </Box>
        )}
      </VoteStats>
      {selectedGauge && (
        <VoteGauge
          imageBaseUrl={networks[1].imageBaseUrl}
          gaugeData={gaugeMapper[formattedSelectedGauge.gaugeAddress]}
          userGaugeVoteData={formattedSelectedGauge}
          availablePower={userData?.data.powerUsed}
        />
      )}
      {userAddress && (
        <PaginatedTable<UserGaugeVoteWeight>
          data={userGauges}
          minWidth={tableMinWidth}
          fetchingState={tableLoading ? 'LOADING' : userData.fetchingState}
          columns={USER_VOTES_TABLE_LABELS}
          sortBy={userGaugeVoteWeightsSortBy}
          errorMessage={t`An error occurred while fetching user gauge weight votes.`}
          noDataMessage={t`No gauge votes found`}
          setSortBy={(key) => setUserGaugeVoteWeightsSortBy(userAddress ?? '', key as UserGaugeVoteWeightSortBy)}
          getData={() => getUserGaugeVoteWeights(userAddress ?? '')}
          renderRow={(gauge, index) => (
            <GaugeListItem
              key={index}
              gaugeData={gaugeMapper[gauge.gaugeAddress]}
              userGaugeWeightVoteData={gauge}
              gridTemplateColumns={gridTemplateColumns}
              powerUsed={userData?.data.powerUsed}
              userGaugeVote={true}
            />
          )}
          gridTemplateColumns={gridTemplateColumns}
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const VoteStats = styled(Box)<{ selectedGauge: GaugeFormattedData | null }>`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  ${({ selectedGauge }) => selectedGauge && `border-bottom: 1px solid var(--gray-500a20)`}
`

const StyledInternalLink = styled(InternalLink)`
  text-decoration: none;
  color: inherit;
  text-transform: none;
`

export default CurrentVotes
