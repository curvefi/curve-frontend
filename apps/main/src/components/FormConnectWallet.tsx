import { t } from '@lingui/macro'
import React from 'react'

import { isLoading } from '@/ui/utils'
import useStore from '@/store/useStore'

import Button from '@/ui/Button'
import Spinner from '@/ui/Spinner'
import { useCurve } from '@/entities/curve'

const FormConnectWallet = ({
  loading,
  children,
}: React.PropsWithChildren<{
  loading: boolean
}>) => {
  const { data: curve } = useCurve()
  const connectState = useStore((state) => state.connectState)
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)
  const provider = useStore((state) => state.wallet.getProvider(''))

  return (
    <>
      {!provider && !isLoading(connectState) ? (
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
