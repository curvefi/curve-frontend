import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useMemo } from 'react'

import useStore from '@/store/useStore'
import { shortenTokenAddress, formatNumber } from '@/ui/utils'

import Icon from '@/ui/Icon'
import Loader from 'ui/src/Loader/Loader'
import ExternalLink from '@/ui/Link/ExternalLink'
import Box from '@/ui/Box'

type Props = {
  noLink?: boolean
  votingPower?: SnapshotVotingPower
}

const UserInformation = ({ noLink, votingPower }: Props) => {
  const { userAddress, userEns, userVeCrv, userVotesMapper } = useStore((state) => state.user)

  return (
    <Box flex flexColumn flexGap="var(--spacing-2)">
      <Box flex flexColumn>
        <SubTitle>{t`User`}</SubTitle>
        {!userAddress ? (
          <Loader skeleton={[80, 16.5]} />
        ) : noLink ? (
          <Box flex flexColumn>
            {userEns ? (
              <UserIdentifier>{userEns}</UserIdentifier>
            ) : (
              <UserIdentifier>{shortenTokenAddress(userAddress ?? '')}</UserIdentifier>
            )}
            {userEns && <SmallAddress>{shortenTokenAddress(userAddress ?? '')}</SmallAddress>}
          </Box>
        ) : (
          <StyledExternalLink href={`https://etherscan.io/address/${userAddress}`}>
            <Box flex flexAlignItems="end">
              {userEns ? (
                <UserIdentifier>{userEns}</UserIdentifier>
              ) : (
                <UserIdentifier>{shortenTokenAddress(userAddress ?? '')}</UserIdentifier>
              )}
              <Icon name="Launch" size={16} />
            </Box>
            {userEns && <SmallAddress>{shortenTokenAddress(userAddress ?? '')}</SmallAddress>}
          </StyledExternalLink>
        )}
      </Box>

      <Box flex flexDirection="column">
        <SubTitle>{t`Snapshot Voting Power`}</SubTitle>
        {votingPower === undefined ? (
          userVeCrv || !userAddress ? (
            <Loader skeleton={[80, 16.5]} />
          ) : (
            <h4>{formatNumber(userVeCrv)} veCRV</h4>
          )
        ) : votingPower.loading ? (
          <Loader skeleton={[80, 16.5]} />
        ) : (
          <h4>{formatNumber(votingPower.value)} veCRV</h4>
        )}
      </Box>
    </Box>
  )
}

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-weight: 500;
  text-decoration: none;
  text-transform: none;
  display: flex;
  flex-direction: column;
`

const UserIdentifier = styled.h4`
  margin-right: var(--spacing-1);
`

const SmallAddress = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.7;
`

const SubTitle = styled.h4`
  font-size: var(--font-size-1);
  opacity: 0.5;
`

export default UserInformation
