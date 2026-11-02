import { isLoading, useCurve, useSwitchChain } from '@evm-ui/features/connect-wallet'
import { replaceNetworkInPath } from '@evm-ui/shared/routes'
import Button from '@mui/material/Button'
import { Chain } from '@primitives/network.utils'
import { RouterLink } from '@ui/components/RouterLink'
import { usePathname } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'

export const ConnectEthereum = () => {
  const { connectState } = useCurve()
  const switchChain = useSwitchChain()
  const pathname = usePathname()
  return (
    <Button
      size="small"
      color="primary"
      href={replaceNetworkInPath(pathname, 'ethereum')}
      onClick={() => void switchChain({ chainId: Chain.Ethereum })}
      component={RouterLink}
      loading={isLoading(connectState)}
      loadingPosition="start"
    >
      {t`Connect to Ethereum`}
    </Button>
  )
}
