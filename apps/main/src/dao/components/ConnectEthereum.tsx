import { useRouter } from 'next/navigation'
import { getPath, getRestFullPathname } from '@/dao/utils/utilsRouter'
import Button from '@ui/Button'
import { useConnection } from '@ui-kit/features/connect-wallet/lib/ConnectionContext'
import { t } from '@ui-kit/lib/i18n'

export const ConnectEthereum = () => {
  const { connectState } = useConnection()
  const { push } = useRouter()
  return (
    <Button
      variant="filled"
      onClick={() => push(getPath({ network: 'ethereum' }, `/${getRestFullPathname()}`))}
      loading={connectState.status === 'loading'}
    >{t`Connect to Ethereum`}</Button>
  )
}
