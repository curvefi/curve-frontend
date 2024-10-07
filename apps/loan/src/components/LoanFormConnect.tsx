import Button from '@/ui/Button'
import Spinner from '@/ui/Spinner'
import { isLoading } from '@/ui/utils'
import { t } from '@lingui/macro'
import React from 'react'

import { CONNECT_STAGE } from '@/constants'
import useStore from '@/store/useStore'


const LoanFormConnect = ({
  haveSigner,
  loading,
  children,
}: React.PropsWithChildren<{
  haveSigner: boolean
  loading?: boolean
}>) => {
  const connectState = useStore((state) => state.connectState)
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
