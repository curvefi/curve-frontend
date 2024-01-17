import { t } from '@lingui/macro'
import styled from 'styled-components'

import { shortenAccount } from '@/lib/utils'
import useStore from '@/store/useStore'

import Button from '@/ui/Button'

const ConnectWallet = ({ className, onClick }: { className?: string; onClick?: () => void }) => {
  const curve = useStore((state) => state.curve)
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)
  const updateWalletStoreByKey = useStore((state) => state.wallet.updateWalletStoreByKey)

  const shortenAddress = curve?.signerAddress ? shortenAccount(curve?.signerAddress) : ''

  const handleDisconnect = async () => {
    updateWalletStoreByKey('isDisconnectWallet', true)
    // close mobile menu
    if (onClick) {
      onClick()
    }
  }

  const handleConnect = async () => {
    // close mobile menu first to show onboard modal
    if (onClick) {
      onClick()
    }

    updateConnectWalletStateKeys()
  }

  const props = {
    className,
    size: 'medium' as const,
    variant: 'icon-outlined' as const,
    online: Boolean(shortenAddress),
  }

  return shortenAddress ? (
    <ConnectButton {...props} testId="navigation-connect-wallet" onClick={handleDisconnect}>
      {shortenAddress}
    </ConnectButton>
  ) : (
    <ConnectButton {...props} testId="navigation-connect-wallet" onClick={handleConnect}>
      {t`Connect Wallet`}
    </ConnectButton>
  )
}

ConnectWallet.defaultProps = {
  className: '',
}

const ConnectButton = styled(Button)<{
  online: boolean
}>`
  border-color: ${({ online }) => (online ? 'var(--nav_button--hover--color)' : 'var(--nav_button--border-color)')};
  box-shadow: 3px 3px 0 var(--button--shadow-color);
  color: inherit;
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

    margin-right: var(--spacing-narrow);

    width: var(--font-size-1);
    height: var(--font-size-1);

    background: ${({ online }) => (online ? 'var(--success-400)' : 'var(--danger-400)')};
    border: 3px solid ${({ online }) => (online ? 'var(--success-600)' : 'var(--danger-600)')};
    border-radius: 50%;
  }
`

export default ConnectWallet
