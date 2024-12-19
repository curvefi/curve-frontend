import React from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Button from '@/ui/Button'
import Spinner from '@/ui/Spinner'

const FormActions = ({
  haveSigner,
  loading,
  children,
}: React.PropsWithChildren<{
  haveSigner: boolean
  loading: boolean
}>) => {
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)

  return (
    <>
      {!haveSigner && !loading ? (
        <Button fillWidth size="large" variant="filled" onClick={updateConnectWalletStateKeys}>
          {t`Connect Wallet`}
        </Button>
      ) : loading ? (
        <Button fillWidth size="large" disabled variant="icon-filled">
          {t`Loading`} <Spinner isDisabled size={15} />
        </Button>
      ) : (
        children
      )}
    </>
  )
}

export default FormActions
