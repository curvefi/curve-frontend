import { getPath, getRestFullPathname } from '@/dao/utils/utilsRouter'
import { Button } from '@ui/Button'
import { isLoading, useCurve } from '@ui-kit/features/connect-wallet'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'

export const ConnectEthereum = () => {
  const { connectState } = useCurve()
  const push = useNavigate()
  return (
    <Button
      variant="filled"
      onClick={() => push(getPath({ network: 'ethereum' }, `/${getRestFullPathname()}`))}
      loading={isLoading(connectState)}
    >{t`Connect to Ethereum`}</Button>
  )
}
