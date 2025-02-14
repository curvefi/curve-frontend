import { t } from '@ui-kit/lib/i18n'
import React from 'react'

import { isLoading } from '@ui/utils'

import Button from '@ui/Button'
import Spinner from '@ui/Spinner'
import { useCurve } from '@/dex/entities/curve'
import useStore from '@/dex/store/useStore'

const FormConnectWallet = ({
  loading,
  children,
}: React.PropsWithChildren<{
  loading: boolean
}>) => {
  const { data: curve } = useCurve()
  const connectState = useStore((state) => state.connectState)
  const connectWallet = useStore((s) => s.updateConnectState)
  return (
    <>
      {!isLoading(connectState) && !loading && !curve?.signerAddress ? (
        <Button fillWidth size="large" variant="filled" onClick={() => connectWallet()}>
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
