import styled from 'styled-components'

import Button from '../Button'
import Spinner from '../Spinner'

type ConnectWalletPromptProps = {
  connectWallet: () => void
  isLoading: boolean
  description: string
  connectText: string
  loadingText: string
}

const ConnectWalletPrompt: React.FC<ConnectWalletPromptProps> = ({
  connectWallet,
  isLoading,
  description,
  connectText,
  loadingText,
}) => {
  return (
    <Wrapper>
      <p>{description}</p>
      {!isLoading ? (
        <Button size="large" fillWidth variant="filled" onClick={connectWallet} loading={isLoading}>
          {connectText}
        </Button>
      ) : (
        <Button disabled size="large" fillWidth variant="icon-filled">
          {loadingText} <Spinner isDisabled size={15} />
        </Button>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-2);
`

export default ConnectWalletPrompt
