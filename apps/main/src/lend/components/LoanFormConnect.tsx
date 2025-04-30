import { ReactNode } from 'react'
import type { Api } from '@/lend/types/lend.types'
import Button from '@ui/Button'
import Spinner from '@ui/Spinner'
import { isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

const LoanFormConnect = ({
  haveSigner,
  loading,
  children,
}: {
  haveSigner: boolean
  loading?: boolean
  children: ReactNode
}) => {
  const { connectState } = useConnection<Api>()
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
