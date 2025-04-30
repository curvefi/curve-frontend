import { ReactNode } from 'react'
import Button from '@ui/Button'
import Spinner from '@ui/Spinner'
import { isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import type { LlamalendApi } from '@ui-kit/shared/useApiStore'

const LoanFormConnect = ({
  haveSigner,
  loading,
  children,
}: {
  haveSigner: boolean
  loading?: boolean
  children: ReactNode
}) => {
  const { connectState } = useConnection<LlamalendApi>()
  const { connect } = useWallet()
  return (
    <>
      {!isLoading(connectState) && !loading && !haveSigner ? (
        <Button fillWidth size="large" variant="filled" onClick={() => connect()}>
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
