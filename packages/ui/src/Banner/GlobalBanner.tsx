import { forwardRef, Ref } from 'react'
import styled from 'styled-components'
import Button from 'ui/src/Button/Button'

export type GlobalBannerProps = {
  networkName: string
  showConnectApiErrorMessage: boolean
  showSwitchNetworkMessage: boolean
  maintenanceMessage?: string
  handleNetworkChange(): void
  ref: Ref<HTMLDivElement>
}

const GlobalBanner = forwardRef<HTMLDivElement, Omit<GlobalBannerProps, 'ref'>>(
  (
    { networkName, showConnectApiErrorMessage, showSwitchNetworkMessage, maintenanceMessage, handleNetworkChange },
    ref,
  ) => (
    <Wrapper ref={ref} show={showSwitchNetworkMessage || showConnectApiErrorMessage || !!maintenanceMessage}>
      {!!maintenanceMessage ? <Message padding="1rem 0">{maintenanceMessage}</Message> : null}
      {showSwitchNetworkMessage && (
        <Message>
          Please switch your wallet&apos;s network to <strong>{networkName}</strong> to use Curve on{' '}
          <strong>{networkName}</strong>.{' '}
          <StyledButton size="small" variant="outlined" onClick={handleNetworkChange}>
            Change network
          </StyledButton>
        </Message>
      )}
      {showConnectApiErrorMessage && (
        <Message>
          There is an issue connecting to the API. You can try switching your RPC or, if you are connected to a wallet,
          please switch to a different one.
        </Message>
      )}
    </Wrapper>
  ),
)

GlobalBanner.displayName = 'GlobalBanner'

export default GlobalBanner

const Wrapper = styled.div<{
  show: boolean
}>`
  margin: 0;
  max-height: ${({ show }) => (show ? '500px' : '0')};
  overflow: hidden;

  background-color: var(--danger-400);

  transition: max-height 0.25s ease-in;
`

const Message = styled.p<{ padding?: string }>`
  padding: ${({ padding }) => {
    if (padding) {
      return padding
    }
    return `var(--spacing-2);`
  }};

  text-align: center;
  color: var(--white);
  line-height: 1.5;

  strong {
    margin-right: 0.25em;
    text-transform: uppercase;
  }

  a {
    color: inherit;
    text-transform: inherit;
    word-wrap: break-word;
    text-decoration-color: var(--whitea20);
    &:hover {
      color: inherit;
      text-decoration-color: var(--white);
    }
  }
`

const StyledButton = styled(Button)`
  margin-left: var(--spacing-2);

  color: inherit;
  background-color: var(--whitea10);
  border: 1px solid var(--whitea20);
  text-transform: uppercase;

  &:hover:not(:disabled) {
    color: inherit;
    border-color: inherit;
    background-color: var(--whitea20);
    box-shadow: 3px 3px 0 var(--box--primary--shadow-color);
  }
`
