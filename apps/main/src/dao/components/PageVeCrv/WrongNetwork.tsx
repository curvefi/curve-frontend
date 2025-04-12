import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { CONNECT_STAGE } from '@/dao/constants'
import useStore from '@/dao/store/useStore'
import { getPath, getRestFullPathname } from '@/dao/utils/utilsRouter'
import Box from '@ui/Box'
import Button from '@ui/Button'
import { t } from '@ui-kit/lib/i18n'

export const WrongNetwork = () => {
  const connectState = useStore((state) => state.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const { push } = useRouter()
  const restPartialPathname = getRestFullPathname()
  const isLoading = connectState.status === 'loading'

  const handleSwitchNetwork = () => {
    push(getPath({ network: 'ethereum' }, `/${restPartialPathname}`))
    updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [1, 1])
  }

  return (
    <Box
      flex
      flexGap="1rem"
      flexAlignItems="center"
      flexJustifyContent="center"
      flexDirection="column"
      margin="1.5rem auto"
    >
      <WrongNetworkMessage>{t`Interacting with veCRV is only available on Ethereum Mainnet.`}</WrongNetworkMessage>
      <Button variant="filled" onClick={handleSwitchNetwork} loading={isLoading}>{t`Connect to Ethereum`}</Button>
    </Box>
  )
}

const WrongNetworkMessage = styled.p`
  font-size: var(--font-size-2);
  max-width: 16rem;
  text-align: center;
`
