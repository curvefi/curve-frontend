import { ReactNode } from 'react'
import { styled } from 'styled-components'
import { useChainId, useConnection } from 'wagmi'
import { ConnectEthereum } from '@/dao/components/ConnectEthereum'
import { ActiveProposal, SnapshotVotingPower } from '@/dao/types/dao.types'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { isLoading, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { UserInformation } from './UserInformation'

type Props = {
  children?: ReactNode
  className?: string
  votingPower?: SnapshotVotingPower
  activeProposal?: ActiveProposal
  snapshotVotingPower: boolean
}

export const UserBox = ({ className, children, votingPower, snapshotVotingPower, activeProposal }: Props) => {
  const { address } = useConnection()
  const chainId = useChainId()
  const { connectState, connect } = useWallet()

  return (
    <Wrapper className={className}>
      {address && chainId === 1 ? (
        <Box flex flexColumn flexGap="var(--spacing-3)">
          <UserInformation
            votingPower={votingPower}
            snapshotVotingPower={snapshotVotingPower}
            activeProposal={activeProposal}
          />
          {children}
        </Box>
      ) : chainId === 1 ? (
        <Box flex flexColumn flexGap="var(--spacing-2)">
          <p>{t`Please connect a wallet to see user information.`}</p>
          <StyledButton variant="outlined" onClick={() => connect()} loading={isLoading(connectState)}>
            {t`Connect Wallet`}
          </StyledButton>
        </Box>
      ) : (
        <Box flex flexColumn flexGap="var(--spacing-2)">
          <p>{t`Please connect to Ethereum Mainnet to see user information.`}</p>
          <ConnectEthereum />
        </Box>
      )}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  padding: var(--spacing-3);
`

const StyledButton = styled(Button)`
  display: flex;
  margin: 0 auto 0 0;
  justify-content: center;
  &.success {
    color: var(--success-400);
    border: 2px solid var(--success-400);
    background-color: var(--success-600);
  }
`
