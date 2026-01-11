import { Fragment, useMemo } from 'react'
import { styled } from 'styled-components'
import { GaugeListItem } from '@/dao/components/PageGauges/GaugeListItem'
import { SmallScreenCard } from '@/dao/components/PageGauges/GaugeListItem/SmallScreenCard'
import { GaugeVotingStats } from '@/dao/components/PageGauges/GaugeVoting/GaugeVotingStats'
import { VoteGauge } from '@/dao/components/PageGauges/GaugeVoting/VoteGauge'
import { PaginatedTable } from '@/dao/components/PaginatedTable'
import {
  invalidateUserGaugeWeightVotesQuery,
  useUserGaugeWeightVotesQuery,
} from '@/dao/entities/user-gauge-weight-votes'
import { useGauges } from '@/dao/queries/gauges.query'
import { useStore } from '@/dao/store/useStore'
import {
  GaugeFormattedData,
  UserGaugeVoteWeight,
  UserGaugeVoteWeightSortBy,
  SortDirection,
} from '@/dao/types/dao.types'
import { findRootGauge } from '@/dao/utils'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import { Chain } from '@ui-kit/utils/network'
import { USER_VOTES_TABLE_LABELS } from './constants'

type CurrentVotesProps = {
  userAddress: string | undefined
}

const sortGauges = (gauges: UserGaugeVoteWeight[], order: SortDirection, sortBy: UserGaugeVoteWeightSortBy) =>
  [...gauges].sort((a, b) => (order === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]))

export const CurrentVotes = ({ userAddress: userAddressProp }: CurrentVotesProps) => {
  const setUserGaugeVoteWeightsSortBy = useStore((state) => state.user.setUserGaugeVoteWeightsSortBy)
  const userGaugeVoteWeightsSortBy = useStore((state) => state.user.userGaugeVoteWeightsSortBy)
  const { data: gaugeMapper = {}, isLoading: isLoadingGauges } = useGauges({})
  const selectedGauge = useStore((state) => state.gauges.selectedGauge)
  const userAddress = userAddressProp ?? ''

  const {
    data: userGaugeWeightVotes,
    isSuccess: userGaugeWeightsSuccess,
    isLoading: userGaugeWeightsLoading,
    isError: userGaugeWeightsError,
  } = useUserGaugeWeightVotesQuery({
    chainId: Chain.Ethereum, // DAO is only used on mainnet
    userAddress: userAddress,
  })

  const tableLoading = userGaugeWeightsLoading || isLoadingGauges

  const tableMinWidth = 0
  const gridTemplateColumns = '17.5rem 1fr 1fr 1fr'
  const smallScreenBreakpoint = 42.3125

  const userGauges = useMemo(
    () =>
      userGaugeWeightVotes?.gauges.map((gauge) => ({
        ...gauge,
        rootGaugeAddress: findRootGauge(gauge.gaugeAddress, gaugeMapper),
      })) ?? [],
    [userGaugeWeightVotes, gaugeMapper],
  )

  const formattedSelectedGauge: UserGaugeVoteWeight = {
    title: selectedGauge?.title ?? '',
    userPower: 0,
    userVeCrv: 0,
    expired: false,
    gaugeAddress: selectedGauge?.effective_address?.toLowerCase() ?? selectedGauge?.address.toLowerCase() ?? '',
    rootGaugeAddress: selectedGauge?.address ?? '',
    isKilled: selectedGauge?.is_killed ?? false,
    lpTokenAddress: selectedGauge?.lp_token ?? '',
    network: selectedGauge?.pool?.chain ?? selectedGauge?.market?.chain ?? '',
    poolAddress: selectedGauge?.pool?.address ?? '',
    poolName: selectedGauge?.pool?.name ?? selectedGauge?.market?.name ?? '',
    poolUrl: '', // not available from prices
    relativeWeight: selectedGauge?.gauge_relative_weight ?? 0,
    totalVeCrv: 0,
    userFutureVeCrv: 0,
  }

  return (
    <Wrapper>
      <VoteStats selectedGauge={selectedGauge}>
        <h3>{t`USER GAUGE VOTES`}</h3>
        {userAddress && <GaugeVotingStats userAddress={userAddress} />}
      </VoteStats>
      {selectedGauge && (
        <VoteGauge
          gaugeData={gaugeMapper[formattedSelectedGauge.gaugeAddress]}
          userGaugeVoteData={formattedSelectedGauge}
          powerUsed={userGaugeWeightVotes?.powerUsed ?? 0}
        />
      )}
      {userAddress && (
        <PaginatedTable<UserGaugeVoteWeight>
          data={sortGauges(userGauges, userGaugeVoteWeightsSortBy.order, userGaugeVoteWeightsSortBy.key)}
          minWidth={tableMinWidth}
          isLoading={tableLoading}
          isSuccess={userGaugeWeightsSuccess}
          isError={userGaugeWeightsError}
          columns={USER_VOTES_TABLE_LABELS}
          sortBy={userGaugeVoteWeightsSortBy}
          errorMessage={t`An error occurred while fetching user gauge weight votes.`}
          noDataMessage={t`No gauge votes found`}
          setSortBy={(key) => setUserGaugeVoteWeightsSortBy(key as UserGaugeVoteWeightSortBy)}
          getData={() => invalidateUserGaugeWeightVotesQuery({ chainId: Chain.Ethereum, userAddress })}
          renderRow={(gauge, index) => (
            <Fragment key={index}>
              <GaugeListItemWrapper>
                <GaugeListItem
                  gaugeData={gaugeMapper[gauge.gaugeAddress.toLowerCase()]}
                  userGaugeWeightVoteData={gauge}
                  gridTemplateColumns={gridTemplateColumns}
                  powerUsed={userGaugeWeightVotes?.powerUsed ?? 0}
                  userGaugeVote={true}
                  userAddress={userAddress}
                />
              </GaugeListItemWrapper>
              <SmallScreenCardWrapper>
                <SmallScreenCard
                  gaugeData={gaugeMapper[gauge.gaugeAddress.toLowerCase()]}
                  userGaugeWeightVoteData={gauge}
                  powerUsed={userGaugeWeightVotes?.powerUsed ?? 0}
                  userGaugeVote={true}
                />
              </SmallScreenCardWrapper>
            </Fragment>
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
