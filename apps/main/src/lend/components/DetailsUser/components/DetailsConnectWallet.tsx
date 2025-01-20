import React from 'react'
import { t } from '@lingui/macro'
import useStore from '@lend/store/useStore'

import { CONNECT_STAGE } from '@lend/constants'
import Box from '@ui/Box'
import Button from '@ui/Button'
import { useWalletStore } from '@ui-kit/features/connect-wallet'

const DetailsConnectWallet = () => {
  const connectState = useWalletStore((s) => s.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)

  return (
    <Box flex flexJustifyContent="center" padding="var(--spacing-5)">
      <Button
        variant="filled"
        loading={connectState.status === 'loading'}
        onClick={() => updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, [''])}
      >
        {connectState.status === 'loading' ? t`Connecting...` : t`Connect Wallet`}
      </Button>
    </Box>
  )
}

export default DetailsConnectWallet
