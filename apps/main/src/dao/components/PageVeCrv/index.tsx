import { useConnection } from 'wagmi'
import { useLockerLockedAmountAndUnlockTime } from '@/dao/entities/locker-vecrv-info'
import { networksIdMapper } from '@/dao/networks'
import type { NetworkUrlParams } from '@/dao/types/dao.types'
import { ConnectWalletPrompt } from '@evm-ui/features/connect-wallet'
import { useParams } from '@evm-ui/hooks/router'
import { ErrorMessage } from '@evm-ui/shared/ui/ErrorMessage'
import { FormPlacementProvider } from '@evm-ui/widgets/DetailPageLayout/form-context/FormPlacementProvider'
import { FormSkeleton } from '@evm-ui/widgets/DetailPageLayout/FormSkeleton'
import Box from '@mui/material/Box'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { FormCrvLocker } from './components/FormCrvLocker'

const { MaxWidth, Spacing } = SizesAndSpaces

export const VeCrv = () => {
  const { network } = useParams<NetworkUrlParams>()
  const { address: userAddress } = useConnection()
  const chainId = networksIdMapper[network]
  const { data, error, isLoading } = useLockerLockedAmountAndUnlockTime({ chainId, userAddress })
  return (
    <FormPlacementProvider placement="inline">
      <Box
        data-testid="vecrv-page"
        sx={{ maxWidth: MaxWidth.actionCard, marginInline: 'auto', marginBlock: Spacing.md }}
      >
        {data && <FormCrvLocker chainId={chainId} {...data} />}
        {isLoading && <FormSkeleton />}
        {error && <ErrorMessage title={t`Locker Error`} error={error} />}
        {!userAddress && <ConnectWalletPrompt description={t`Please connect your wallet to view your locked CRV.`} />}
      </Box>
    </FormPlacementProvider>
  )
}
