import { t } from '@lingui/macro'
import React from 'react'

import { isLoading } from '@ui/utils'

import Button from '@ui/Button'
import Spinner from '@ui/Spinner'
import { useCurve } from '@main/entities/curve'
import { useWalletStore } from '@ui-kit/features/connect-wallet'

const FormConnectWallet = ({
  loading,
  children,
}: React.PropsWithChildren<{
  loading: boolean
}>) => {
  const { data: curve } = useCurve()
  const connectState = useWalletStore((s) => s.connectState)
  const connectWallet = useWalletStore((s) => s.connectWallet)
  return (
    <>
      {!isLoading(connectState) && !loading && !curve?.signerAddress ? (
        <Button fillWidth size="large" variant="filled" onClick={connectWallet}>
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
