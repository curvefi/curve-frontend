import { ReactNode } from 'react'
import { Button } from '@ui/Button'
import { Spinner } from '@ui/Spinner'
import { isLoading, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

export const LoanFormConnect = ({
  haveSigner,
  loading,
  children,
}: {
  children: ReactNode
  haveSigner: boolean
  loading?: boolean
}) => {
  const { connectState, connect } = useWallet()
  return (
    <>
      {!isLoading(connectState) && !loading && !haveSigner ? (
        <Button fillWidth size="large" variant="filled" onClick={() => connect()} loading={isLoading(connectState)}>
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
