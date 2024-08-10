import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useEffect } from 'react'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import UserStats from './UserStats'
import UserHeader from './UserHeader'
import UserProposalVotesTable from './UserProposalVotesTable'
import UserLocksTable from './UserLocksTable'
import UserGaugeVotesTable from './UserGaugeVotesTable'

type Props = {
  routerParams: {
    rUserAddress: string
  }
}

const UserPage = ({ routerParams: { rUserAddress } }: Props) => {
  const {
    veCrvHolders: { allHolders, fetchStatus },
    getVeCrvHolders,
  } = useStore((state) => state.vecrv)
  const { getUserEns, userMapper } = useStore((state) => state.user)
  const { provider } = useStore((state) => state.wallet)

  const userAddress = rUserAddress.toLowerCase()

  const tableMinWidth = 41.875

  const holdersLoading = fetchStatus === 'LOADING'
  const holdersError = fetchStatus === 'ERROR'

  const veCrvHolder: VeCrvHolder = allHolders[userAddress] || {
    user: rUserAddress,
    locked: 0,
    unlock_time: 0,
    weight: 0,
    weight_ratio: 0,
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
      <PageTitle>{t`User`}</PageTitle>
      <UserPageContainer variant="secondary">
        <UserHeader userAddress={userAddress} userMapper={userMapper} />
        <UserStats veCrvHolder={veCrvHolder} holdersLoading={holdersLoading} />
        <UserProposalVotesTable userAddress={userAddress} tableMinWidth={tableMinWidth} />
        <UserLocksTable userAddress={userAddress} tableMinWidth={tableMinWidth} />
        <UserGaugeVotesTable userAddress={userAddress} tableMinWidth={tableMinWidth} />
      </UserPageContainer>
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
  @media (min-width: 34.375rem) {
    max-width: 95%;
  }
`

const PageTitle = styled.h2`
  margin: var(--spacing-2) auto var(--spacing-1) var(--spacing-3);
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
`

const UserPageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-bottom: auto;
  width: 100%;
`

export default UserPage
