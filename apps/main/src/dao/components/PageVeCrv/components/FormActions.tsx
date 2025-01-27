import React from 'react'
import { t } from '@lingui/macro'
import Button from '@ui/Button'
import Spinner from '@ui/Spinner'
import useStore from '@dao/store/useStore'

const FormActions = ({
  haveSigner,
  loading,
  children,
}: React.PropsWithChildren<{
  haveSigner: boolean
  loading: boolean
}>) => {
  const connectWallet = useStore((s) => s.updateConnectState)
  return (
    <>
      {!haveSigner && !loading ? (
        <Button fillWidth size="large" variant="filled" onClick={() => connectWallet()}>
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
