import styled from 'styled-components'
import { useConnectWallet } from '@/onboard'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Button from '@/ui/Button'
import UserInformation from './UserInformation'

type Props = {
  children?: React.ReactNode
  className?: string
  votingPower?: SnapshotVotingPower
  snapshotVotingPower: boolean
}

const UserBox = ({ className, children, votingPower, snapshotVotingPower }: Props) => {
  const [{ wallet }] = useConnectWallet()
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)

  return (
    <Wrapper variant="secondary" className={className}>
      {wallet ? (
        <Box flex flexColumn flexGap="var(--spacing-3)">
          <UserInformation votingPower={votingPower} snapshotVotingPower={snapshotVotingPower} />
          {children}
        </Box>
      ) : (
        <ConnectMessage>
          <p>{t`Please connect a wallet to see more user information.`}</p>
          <StyledButton variant="outlined" onClick={updateConnectWalletStateKeys}>
            {t`Connect Wallet`}
          </StyledButton>
        </ConnectMessage>
      )}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 20rem;
  max-width: 100%;
  gap: var(--spacing-1);
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  padding: var(--spacing-3);
  margin-bottom: var(--spacing-1);
`

const ConnectMessage = styled.div`
  p {
  }
`

const StyledButton = styled(Button)`
  display: flex;
  margin: var(--spacing-2) auto 0 0;
  justify-content: center;
  &.success {
    color: var(--success-400);
    border: 2px solid var(--success-400);
    background-color: var(--success-600);
  }
`

export default UserBox
