import { ReactNode } from 'react'
import { Button } from '@ui/Button'
import { Spinner } from '@ui/Spinner'
import { isLoading, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

export const FormActions = ({
  haveSigner,
  loading,
  children,
}: {
  haveSigner: boolean
  loading: boolean
  children: ReactNode
}) => {
  const { connect, connectState } = useWallet()
  return (
    <>
      {!haveSigner && !loading ? (
        // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
        <Button fillWidth size="large" variant="filled" onClick={() => connect()} loading={isLoading(connectState)}>
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
