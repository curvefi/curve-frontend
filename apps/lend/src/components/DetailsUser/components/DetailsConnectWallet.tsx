import React from 'react'
import { t } from '@lingui/macro'

import { CONNECT_STAGE } from '@/onboard'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Button from '@/ui/Button'

const DetailsConnectWallet = () => {
  const connectState = useStore((state) => state.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)

  return (
    <Box flex flexJustifyContent="center" padding="var(--spacing-5)">
      <Button
        variant="filled"
        loading={connectState.status === 'loading'}
        onClick={() => updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, '')}
      >
        {connectState.status === 'loading' ? t`Connecting...` : t`Connect Wallet`}
      </Button>
    </Box>
  )
}

export default DetailsConnectWallet
