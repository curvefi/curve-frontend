import { useRouter } from 'next/navigation'
import { CONNECT_STAGE } from '@/dao/constants'
import useStore from '@/dao/store/useStore'
import { getPath, getRestFullPathname } from '@/dao/utils/utilsRouter'
import Button from '@ui/Button'
import { t } from '@ui-kit/lib/i18n'

export const ConnectEthereum = () => {
  const connectState = useStore((state) => state.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const { push } = useRouter()
  const restPartialPathname = getRestFullPathname()
  const isLoading = connectState.status === 'loading'

  const handleSwitchNetwork = () => {
    push(getPath({ network: 'ethereum' }, `/${restPartialPathname}`))
    updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [1, 1])
  }

  return <Button variant="filled" onClick={handleSwitchNetwork} loading={isLoading}>{t`Connect to Ethereum`}</Button>
}
