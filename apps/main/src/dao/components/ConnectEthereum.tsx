import { getPath, getRestFullPathname } from '@/dao/utils/utilsRouter'
import Button from '@mui/material/Button'
import { isLoading, useCurve, useSwitchChain } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { Chain } from '@ui-kit/utils'

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
