import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import useStore from '@/dao/store/useStore'
import type { UserUrlParams } from '@/dao/types/dao.types'
import type { Locker } from '@curvefi/prices-api/dao'
import Box from '@ui/Box'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import UserGaugeVotesTable from './UserGaugeVotesTable'
import UserHeader from './UserHeader'
import UserLocksTable from './UserLocksTable'
import UserProposalVotesTable from './UserProposalVotesTable'
import UserStats from './UserStats'

type Tab = 'proposals' | 'gauge_votes' | 'locks'
const tabs: TabOption<Tab>[] = [
  { value: 'proposals', label: t`User Proposal Votes` },
  { value: 'gauge_votes', label: t`User Gauge Votes` },
  { value: 'locks', label: t`User Locks` },
]

type UserPageProps = {
  routerParams: UserUrlParams
}

const UserPage = ({ routerParams: { userAddress: rUserAddress } }: UserPageProps) => {
  const veCrvHolders = useStore((state) => state.analytics.veCrvHolders)
  const getVeCrvHolders = useStore((state) => state.analytics.getVeCrvHolders)
  const getUserEns = useStore((state) => state.user.getUserEns)
  const userMapper = useStore((state) => state.user.userMapper)
  const { provider } = useWallet()
  const [tab, setTab] = useState<Tab>('proposals')

  const { allHolders, fetchStatus } = veCrvHolders

  const userAddress = rUserAddress.toLowerCase()

  const tableMinWidth = 41.875

  const holdersLoading = fetchStatus === 'LOADING'
  const holdersError = fetchStatus === 'ERROR'

  const veCrvHolder: Locker = allHolders[userAddress] || {
    user: rUserAddress,
    locked: 0n,
    weight: 0n,
    weightRatio: 0,
    unlockTime: null,
  }

  useEffect(() => {
    if (Object.keys(allHolders).length === 0 && holdersLoading && !holdersError) {
      void getVeCrvHolders()
    }
  }, [getVeCrvHolders, allHolders, holdersLoading, holdersError])

  // Get user ENS
  useEffect(() => {
    if (!userMapper[userAddress] && provider) {
      void getUserEns(userAddress)
    }
  }, [getUserEns, userAddress, userMapper, provider])

  return (
    <Wrapper>
      <UserPageContainer variant="secondary">
        <UserHeader userAddress={userAddress} userMapper={userMapper} />
        <UserStats veCrvHolder={veCrvHolder} holdersLoading={holdersLoading} />
      </UserPageContainer>
      <Box>
        <TabsSwitcher variant="contained" value={tab} onChange={setTab} options={tabs} />

        <Container variant="secondary">
          {tab === 'proposals' && <UserProposalVotesTable userAddress={userAddress} tableMinWidth={tableMinWidth} />}
          {tab === 'gauge_votes' && <UserGaugeVotesTable userAddress={userAddress} tableMinWidth={tableMinWidth} />}
          {tab === 'locks' && <UserLocksTable userAddress={userAddress} />}
        </Container>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-6);
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  gap: var(--spacing-3);
  @media (min-width: 34.375rem) {
    max-width: 95%;
  }
`

const UserPageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const Container = styled(Box)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: none;
`

export default UserPage
