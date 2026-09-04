import { getPath, getRestFullPathname } from '@/dao/utils/utilsRouter'
import { isLoading, useCurve, useSwitchChain } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { RouterLink } from '@evm-ui/shared/ui/RouterLink'
import { Chain } from '@primitives/network.utils'
import Button from '@mui/material/Button'

export const ConnectEthereum = () => {
  const { connectState } = useCurve()
  const switchChain = useSwitchChain()
  return (
    <Button
      size="small"
      color="primary"
      href={getPath({ network: 'ethereum' }, `/${getRestFullPathname()}`)}
      onClick={() => void switchChain({ chainId: Chain.Ethereum })}
      component={RouterLink}
      loading={isLoading(connectState)}
      loadingPosition="start"
    >
      {t`Connect to Ethereum`}
    </Button>
  )
}
