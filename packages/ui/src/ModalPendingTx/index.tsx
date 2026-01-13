import { styled } from 'styled-components'
import { shortenAddress } from '@ui-kit/utils/address'
import Icon from 'ui/src/Icon'
import ExternalLink from 'ui/src/Link/ExternalLink'
import Spinner from 'ui/src/Spinner'

type Props = {
  transactionHash: string
  txLink: string
  pendingMessage: string
}

const ModalPendingTx = ({ transactionHash, txLink, pendingMessage }: Props) => (
  <PendingContainer>
    <PendingWrapper>
      <PendingMessage>{pendingMessage}</PendingMessage>
      <StyledPendingSpinner isDisabled size={24} />
      <Transaction variant={'contained'} href={txLink}>
        <p>Transaction: {shortenAddress(transactionHash)}</p>
        <StyledIcon name={'Launch'} size={16} />
      </Transaction>
    </PendingWrapper>
  </PendingContainer>
)

const PendingContainer = styled.div`
  position: absolute;
  z-index: 102;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(3px);
  display: flex;
`

const PendingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  margin: auto;
  background: var(--box--secondary--background-color);
  padding: var(--spacing-4) var(--spacing-5);
`

const PendingMessage = styled.h4`
  margin: 0 auto;
`

const Transaction = styled(ExternalLink)`
  display: flex;
  align-items: center;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  color: var(--page--text-color);
  text-decoration: none;
  background-color: var(--page--background-color);
  padding: var(--spacing-2);
  p {
    margin-right: auto;
    font-weight: var(--bold);
  }
`

const StyledIcon = styled(Icon)`
  margin: auto 0 auto var(--spacing-1);
  color: var(--page--text-color);
`

const StyledPendingSpinner = styled(Spinner)`
  margin: var(--spacing-4) auto;
  > div {
    border-color: var(--page--text-color) transparent transparent transparent;
  }
`

export default ModalPendingTx
