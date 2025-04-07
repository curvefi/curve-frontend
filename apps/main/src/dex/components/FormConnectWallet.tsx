import { ReactNode } from 'react'
import useStore from '@/dex/store/useStore'
import Button from '@ui/Button'
import Spinner from '@ui/Spinner'
import { isLoading } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useApiStore } from '@ui-kit/shared/useApiStore'

const FormConnectWallet = ({ loading, children }: { loading: boolean; children: ReactNode }) => {
  const curve = useApiStore((state) => state.curve)
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
