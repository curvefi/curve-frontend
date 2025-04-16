import { ReactNode } from 'react'
import Button from '@ui/Button'
import Spinner from '@ui/Spinner'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

const FormActions = ({
  haveSigner,
  loading,
  children,
}: {
  haveSigner: boolean
  loading: boolean
  children: ReactNode
}) => {
  const { connect } = useWallet()
  return (
    <>
      {!haveSigner && !loading ? (
        <Button fillWidth size="large" variant="filled" onClick={() => connect()}>
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

export default FormActions
