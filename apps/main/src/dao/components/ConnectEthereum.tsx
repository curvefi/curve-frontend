import { useNavigate } from 'react-router'
import { getPath, getRestFullPathname } from '@/dao/utils/utilsRouter'
import Button from '@ui/Button'
import { isLoading, useConnection } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

export const ConnectEthereum = () => {
  const { connectState } = useConnection()
  const push = useNavigate()
  return (
    <Button
      variant="filled"
      onClick={() => push(getPath({ network: 'ethereum' }, `/${getRestFullPathname()}`))}
      loading={isLoading(connectState)}
    >{t`Connect to Ethereum`}</Button>
  )
}
