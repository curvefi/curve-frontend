import { t } from '@lingui/macro'
import React from 'react'

import { CONNECT_STAGE } from '@lend/constants'
import { isLoading } from '@ui/utils'
import useStore from '@lend/store/useStore'

import Button from '@ui/Button'
import Spinner from '@ui/Spinner'
import { useWalletStore } from '@ui-kit/features/connect-wallet'

const LoanFormConnect = ({
  haveSigner,
  loading,
  children,
}: React.PropsWithChildren<{
  haveSigner: boolean
  loading?: boolean
}>) => {
  const connectState = useWalletStore((s) => s.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const handleConnectClick = () => {
    updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, [''])
  }

  return (
    <>
      {!isLoading(connectState) && !loading && !haveSigner ? (
        <Button fillWidth size="large" variant="filled" onClick={handleConnectClick}>
          {t`Connect Wallet`}
        </Button>
      ) : isLoading(connectState) || loading ? (
        <Button fillWidth size="large" disabled variant="icon-filled">
          {t`Loading`} <Spinner isDisabled size={15} />
        </Button>
      ) : (
        children
      )}
    </>
  )
}

export default LoanFormConnect
