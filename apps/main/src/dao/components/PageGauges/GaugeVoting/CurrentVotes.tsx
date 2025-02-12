import React from 'react'
import styled from 'styled-components'
import { t } from '@ui-kit/lib/i18n'
import { useEffect } from 'react'

import useStore from '@/dao/store/useStore'

import networks from '@/dao/networks'

import { USER_VOTES_TABLE_LABELS } from './constants'
import Box from '@ui/Box'
import PaginatedTable from '@/dao/components/PaginatedTable'
import VoteGauge from '@/dao/components/PageGauges/GaugeVoting/VoteGauge'
import GaugeListItem from '@/dao/components/PageGauges/GaugeListItem'
import SmallScreenCard from '@/dao/components/PageGauges/GaugeListItem/SmallScreenCard'
import GaugeVotingStats from '@/dao/components/PageGauges/GaugeVoting/GaugeVotingStats'
import { GaugeFormattedData, UserGaugeVoteWeight, UserGaugeVoteWeightSortBy } from '@/dao/types/dao.types'

type CurrentVotesProps = {
  userAddress: string | undefined
}

const CurrentVotes = ({ userAddress }: CurrentVotesProps) => {
  const userData = useStore((state) => state.user.userGaugeVoteWeightsMapper[userAddress?.toLowerCase() ?? ''])
  const {
    setUserGaugeVoteWeightsSortBy,
    userGaugeVoteWeightsSortBy,
    getUserGaugeVoteWeights,
    getAllVoteForGaugeNextTime,
  } = useStore((state) => state.user)
  const { gaugeMapper, selectedGauge, gaugesLoading } = useStore((state) => state.gauges)

  const userGauges = userData?.data.gauges ?? []
  const userWeightsLoading = !userData || userData?.fetchingState === 'LOADING'
  const gaugeMapperLoading = gaugesLoading === 'LOADING'
  const userWeightReady = userData?.fetchingState === 'SUCCESS'
  const tableLoading = userWeightsLoading || gaugeMapperLoading

  const tableMinWidth = 0
  const gridTemplateColumns = '17.5rem 1fr 1fr 1fr'
  const smallScreenBreakpoint = 42.3125

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
    canVote: true,
  }

  // Get next vote time for all gauges
  useEffect(() => {
    if (userWeightReady) {
      getAllVoteForGaugeNextTime(userAddress ?? '')
    }
  }, [userAddress, userWeightReady, getAllVoteForGaugeNextTime])

  return (
    <Wrapper>
      <VoteStats selectedGauge={selectedGauge}>
        <h3>{t`USER GAUGE VOTES`}</h3>
        {userAddress && <GaugeVotingStats userAddress={userAddress} />}
      </VoteStats>
      {selectedGauge && (
        <VoteGauge
          imageBaseUrl={networks[1].imageBaseUrl}
          gaugeData={gaugeMapper[formattedSelectedGauge.gaugeAddress]}
          userGaugeVoteData={formattedSelectedGauge}
          powerUsed={userData?.data.powerUsed}
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
            <React.Fragment key={index}>
              <GaugeListItemWrapper>
                <GaugeListItem
                  gaugeData={gaugeMapper[gauge.gaugeAddress]}
                  userGaugeWeightVoteData={gauge}
                  gridTemplateColumns={gridTemplateColumns}
                  powerUsed={userData?.data.powerUsed}
                  userGaugeVote={true}
                />
              </GaugeListItemWrapper>
              <SmallScreenCardWrapper>
                <SmallScreenCard
                  gaugeData={gaugeMapper[gauge.gaugeAddress]}
                  userGaugeWeightVoteData={gauge}
                  powerUsed={userData?.data.powerUsed}
                  userGaugeVote={true}
                />
              </SmallScreenCardWrapper>
            </React.Fragment>
          )}
          gridTemplateColumns={gridTemplateColumns}
          smallScreenBreakpoint={smallScreenBreakpoint}
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
  ${({ selectedGauge }) => selectedGauge && `border-bottom: 1px solid var(--gray-500a20);`}
  @media (max-width: 42.375rem) {
    padding-bottom: var(--spacing-3);
    border-bottom: 1px solid var(--gray-500a20);
  }
`

const GaugeListItemWrapper = styled.div`
  @media (max-width: 42.375rem) {
    display: none;
  }
`

const SmallScreenCardWrapper = styled.div`
  display: none;

  @media (max-width: 42.375rem) {
    display: block;
  }
`

export default CurrentVotes
