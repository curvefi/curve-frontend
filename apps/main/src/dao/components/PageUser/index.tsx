import styled from 'styled-components'
import { t } from '@ui-kit/lib/i18n'
import { useEffect, useState } from 'react'
import useStore from '@/dao/store/useStore'
import Box from '@ui/Box'
import UserStats from './UserStats'
import UserHeader from './UserHeader'
import UserProposalVotesTable from './UserProposalVotesTable'
import UserLocksTable from './UserLocksTable'
import UserGaugeVotesTable from './UserGaugeVotesTable'
import SubNav from '@/dao/components/SubNav'
import type { Locker } from '@curvefi/prices-api/dao'
import { useWallet } from '@ui-kit/features/connect-wallet'
import type { UserUrlParams } from '@/dao/types/dao.types'

type UserPageProps = {
  routerParams: UserUrlParams
}

const UserPage = ({ routerParams: { userAddress: rUserAddress } }: UserPageProps) => {
  const {
    veCrvHolders: { allHolders, fetchStatus },
    getVeCrvHolders,
  } = useStore((state) => state.analytics)
  const { getUserEns, userMapper } = useStore((state) => state.user)
  const { provider } = useWallet()
  const [activeNavKey, setNavKey] = useState('proposals')

  const navItems = [
    { key: 'proposals', label: t`User Proposal Votes` },
    { key: 'gauge_votes', label: t`User Gauge Votes` },
    { key: 'locks', label: t`User Locks` },
  ]

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
      getVeCrvHolders()
    }
  }, [getVeCrvHolders, allHolders, holdersLoading, holdersError])

  // Get user ENS
  useEffect(() => {
    if (!userMapper[userAddress] && provider) {
      getUserEns(userAddress)
    }
  }, [getUserEns, userAddress, userMapper, provider])

  return (
    <Wrapper>
      <UserPageContainer variant="secondary">
        <UserHeader userAddress={userAddress} userMapper={userMapper} />
        <UserStats veCrvHolder={veCrvHolder} holdersLoading={holdersLoading} />
      </UserPageContainer>
      <Box>
        <SubNav activeKey={activeNavKey} navItems={navItems} setNavChange={setNavKey} />
        <Container variant="secondary">
          {activeNavKey === 'proposals' && (
            <UserProposalVotesTable userAddress={userAddress} tableMinWidth={tableMinWidth} />
          )}
          {activeNavKey === 'gauge_votes' && (
            <UserGaugeVotesTable userAddress={userAddress} tableMinWidth={tableMinWidth} />
          )}
          {activeNavKey === 'locks' && <UserLocksTable userAddress={userAddress} />}
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
  padding-top: var(--spacing-1);
`

export default UserPage
