import type { ButtonProps } from 'ui/src/Button/types'
import type { ConnectState } from 'onboard-helpers'

import styled from 'styled-components'
import * as React from 'react'

import { CONNECT_STAGE, isLoading, isSuccess } from 'onboard-helpers'
import { shortenAccount } from 'ui/src/utils'
import Button from 'ui/src/Button/index'

type Status = 'success' | 'loading' | ''

function ConnectWallet({
  className,
  connectState,
  walletSignerAddress,
  handleClick,
  ...props
}: ButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string
    testId?: string
    connectState: ConnectState
    walletSignerAddress: string
    handleClick: () => void
  }) {
  const loading =
    isLoading(connectState, [CONNECT_STAGE.CONNECT_WALLET, CONNECT_STAGE.DISCONNECT_WALLET]) ||
    (isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK) && !!walletSignerAddress) ||
    (isLoading(connectState, CONNECT_STAGE.CONNECT_API) && !!walletSignerAddress)

  return (
    <ConnectButton
      {...props}
      className={className}
      disabled={loading}
      loading={loading}
      status={getStatus(connectState, walletSignerAddress)}
      size="medium"
      variant="icon-outlined"
      testId="navigation-connect-wallet"
      onClick={handleClick}
    >
      {getLabel(connectState, walletSignerAddress)}
    </ConnectButton>
  )
}

ConnectWallet.displayName = 'ConnectWallet'
ConnectWallet.defaultProps = {
  className: '',
}

const ConnectButton = styled(Button)<{
  status: Status
}>`
  border-color: ${({ status }) =>
    status === 'success' ? 'var(--nav_button--hover--color)' : 'var(--nav_button--border-color)'};
  box-shadow: 3px 3px 0 var(--button--shadow-color);
  color: inherit;
  cursor: ${({ status }) => (status === 'loading' ? 'initial' : 'pointer')};
  font-size: var(--font-size-2);
  position: relative;
  text-transform: uppercase;

  :active {
    box-shadow: none;
    transform: translate3d(3px, 3px, 3px);
  }

  :hover {
    color: var(--nav_button--hover--color);
    border-color: var(--nav_button--hover--color);
  }

  // Status symbol
  &:before {
    display: inline-block;
    content: '';

    margin-right: 0.3rem;

    width: var(--font-size-1);
    height: var(--font-size-1);

    background: ${({ status }) => (status === 'success' ? 'var(--success-400)' : 'var(--danger-400)')};
    border: 3px solid ${({ status }) => (status === 'success' ? 'var(--success-600)' : 'var(--danger-600)')};
    border-radius: 50%;
  }
`

export default ConnectWallet

function getLabel(connectState: ConnectState, walletSignerAddress: string | undefined) {
  if (isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK) && !!walletSignerAddress) {
    return 'Switching...'
  }

  if (isLoading(connectState, CONNECT_STAGE.DISCONNECT_WALLET)) {
    return 'Disconnecting...'
  }

  if (
    isLoading(connectState, CONNECT_STAGE.CONNECT_WALLET) ||
    (isLoading(connectState, CONNECT_STAGE.CONNECT_API) && !!walletSignerAddress)
  ) {
    return 'Connecting...'
  }

  if (walletSignerAddress) {
    return shortenAccount(walletSignerAddress)
  }

  return 'Connect Wallet'
}

function getStatus(connectState: ConnectState, walletSignerAddress: string | undefined) {
  if (isSuccess(connectState) && !!walletSignerAddress) {
    return 'success'
  } else if (isLoading(connectState)) {
    return 'loading'
  } else {
    return ''
  }
}
