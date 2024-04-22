import styled from 'styled-components'
import { useConnectWallet } from '@/onboard'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Button from '@/ui/Button'
import VoteDialog from './VoteDialog'
import UserInformation from './UserInformation'

const UserBox = () => {
  const [{ wallet }] = useConnectWallet()
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)

  return (
    <Wrapper variant="secondary">
      {wallet ? (
        <Box flex flexColumn flexGap="var(--spacing-3)">
          <UserInformation />
          <VoteDialog />
        </Box>
      ) : (
        <StyledButton variant="filled" onClick={updateConnectWalletStateKeys}>
          {t`Connect Wallet`}
        </StyledButton>
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

const StyledButton = styled(Button)`
  padding: var(--spacing-2) var(--spacing-5);
  display: flex;
  margin: 0 auto 0;
  justify-content: center;
  &.success {
    color: var(--success-400);
    border: 2px solid var(--success-400);
    background-color: var(--success-600);
  }
`

export default UserBox
