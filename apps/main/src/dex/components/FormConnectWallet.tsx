import { ReactNode } from 'react'
import Button from '@ui/Button'
import Spinner from '@ui/Spinner'
import { isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

const FormConnectWallet = ({ loading, children }: { loading: boolean; children: ReactNode }) => {
  const { connectState, curveApi } = useConnection()
  const { connect: connectWallet } = useWallet()
  return (
    <>
      {!isLoading(connectState) && !loading && !curveApi?.signerAddress ? (
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
