import { t } from '@lingui/macro'
import React from 'react'

import useStore from '@/store/useStore'

import Button from '@/ui/Button'
import Spinner from '@/ui/Spinner'

type Props = {
  haveSigner: boolean
  loading?: boolean
}

const LoanFormConnect = ({ haveSigner, loading, children }: React.PropsWithChildren<Props>) => {
  const updateWalletStateByKey = useStore((state) => state.wallet.setStateByKey)

  const handleConnectClick = () => {
    updateWalletStateByKey('isConnectWallet', true)
  }

  return (
    <>
      {!haveSigner && !loading ? (
        <Button fillWidth size="large" variant="filled" onClick={handleConnectClick}>
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

export default LoanFormConnect
