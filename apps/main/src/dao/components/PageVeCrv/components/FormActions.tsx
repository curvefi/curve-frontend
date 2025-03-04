import { ReactNode } from 'react'
import { t } from '@ui-kit/lib/i18n'
import Button from '@ui/Button'
import Spinner from '@ui/Spinner'
import useStore from '@/dao/store/useStore'

const FormActions = ({
  haveSigner,
  loading,
  children,
}: {
  haveSigner: boolean
  loading: boolean
  children: ReactNode
}) => {
  const connectWallet = useStore((s) => s.updateConnectState)
  return (
    <>
      {!haveSigner && !loading ? (
        <Button fillWidth size="large" variant="filled" onClick={() => connectWallet()}>
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
