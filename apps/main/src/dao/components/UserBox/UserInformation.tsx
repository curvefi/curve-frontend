import { useMemo } from 'react'
import { styled } from 'styled-components'
import { useConnection, useEnsName } from 'wagmi'
import { useStore } from '@/dao/store/useStore'
import { SnapshotVotingPower, ActiveProposal } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import { Box } from '@ui/Box'
import { InternalLink } from '@ui/Link/InternalLink'
import { Loader } from '@ui/Loader/Loader'
import { TooltipIcon } from '@ui/Tooltip/TooltipIcon'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { shortenAddress } from '@ui-kit/utils'

type Props = {
  noLink?: boolean
  snapshotVotingPower: boolean
  activeProposal?: ActiveProposal
  votingPower?: SnapshotVotingPower
}

export const UserInformation = ({ noLink, snapshotVotingPower, activeProposal, votingPower }: Props) => {
  const { address: userAddress } = useConnection()
  const { data: userEns } = useEnsName({ address: userAddress })

  const userVeCrv = useStore((state) => state.user.userVeCrv)

  const decayedVeCrv = useMemo(() => {
    if (activeProposal?.active && votingPower) {
      const { startTimestamp, endTimestamp } = activeProposal
      const currentDate = Date.now() / 1000
      const halfwayDate = (startTimestamp + endTimestamp) / 2

      if (currentDate >= halfwayDate && currentDate <= endTimestamp) {
        const totalDuration = endTimestamp - startTimestamp
        const elapsedDuration = currentDate - halfwayDate
        const decayFactor = elapsedDuration / (totalDuration / 2)
        const decayedValue = votingPower.value * (1 - decayFactor)
        return { decaying: true, value: decayedValue }
      }
    }

    return { decaying: false, value: votingPower?.value ?? 0 }
  }, [activeProposal, votingPower])

  return (
    <Box flex flexColumn flexGap="var(--spacing-2)">
      <Box flex flexColumn>
        <SubTitle>{t`User`}</SubTitle>
        {!userAddress ? (
          <Loader isLightBg skeleton={[80, 16.5]} />
        ) : noLink ? (
          <Box flex flexColumn>
            {userEns ? (
              <UserIdentifier>{userEns}</UserIdentifier>
            ) : (
              <UserIdentifier>{shortenAddress(userAddress ?? '')}</UserIdentifier>
            )}
            {userEns && <SmallAddress>{shortenAddress(userAddress ?? '')}</SmallAddress>}
          </Box>
        ) : (
          <StyledInternalLink href={getEthPath(`${DAO_ROUTES.PAGE_USER}/${userAddress}`)}>
            <Box flex flexAlignItems="end">
              {userEns ? (
                <UserIdentifier>{userEns}</UserIdentifier>
              ) : (
                <UserIdentifier>{shortenAddress(userAddress ?? '')}</UserIdentifier>
              )}
            </Box>
            {userEns && <SmallAddress>{shortenAddress(userAddress ?? '')}</SmallAddress>}
          </StyledInternalLink>
        )}
      </Box>

      <Box flex flexDirection="column" flexGap="var(--spacing-2)">
        {!snapshotVotingPower && (
          <Box flex flexDirection="column">
            <SubTitle>{t`Voting Power`}</SubTitle>
            {!userVeCrv || !userAddress ? (
              <Loader isLightBg skeleton={[80, 16.5]} />
            ) : (
              <h4>{formatNumber(userVeCrv.veCrv)} veCRV</h4>
            )}
          </Box>
        )}
        {snapshotVotingPower && votingPower !== undefined && (
          <Box flex flexDirection="column">
            <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
              <SubTitle>{t`Voting Power at Snapshot`}</SubTitle>
              <TooltipIcon minWidth="200px">
                <p>{t`Voting power at snapshot block ${votingPower.blockNumber}`}</p>
              </TooltipIcon>
            </Box>
            <h4>{formatNumber(votingPower.value)} veCRV</h4>
          </Box>
        )}
        {decayedVeCrv.decaying && votingPower?.value !== 0 && (
          <Box flex flexDirection="column">
            <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
              <SubTitle>{t`Current Voting Power (Decaying)`}</SubTitle>
              <TooltipIcon minWidth="200px">
                <p>{t`Halfway into a proposal vote (3.5 days after creation), voting power begins decaying linearly towards 0 at the end of the proposal vote.`}</p>
              </TooltipIcon>
            </Box>
            <h4>{formatNumber(decayedVeCrv.value)} veCRV</h4>
          </Box>
        )}
      </Box>
    </Box>
  )
}

const StyledInternalLink = styled(InternalLink)`
  color: inherit;
  font-weight: 500;
  text-decoration: none;
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
