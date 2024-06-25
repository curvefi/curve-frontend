import { t } from '@lingui/macro'
import React from 'react'

import { isLoading } from '@/onboard'
import useStore from '@/store/useStore'

import Button from '@/ui/Button'
import Spinner from '@/ui/Spinner'

const FormConnectWallet = ({
  curve,
  loading,
  children,
}: React.PropsWithChildren<{
  curve: CurveApi | null
  loading: boolean
}>) => {
  const connectState = useStore((state) => state.connectState)
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)

  return (
    <>
      {!isLoading(connectState) && !loading && !curve?.signerAddress ? (
        <Button fillWidth size="large" variant="filled" onClick={updateConnectWalletStateKeys}>
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

export default FormConnectWallet
