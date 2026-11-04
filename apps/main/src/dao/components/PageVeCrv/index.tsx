import { useConnection } from 'wagmi'
import { useLockerLockedAmountAndUnlockTime } from '@/dao/entities/locker-vecrv-info'
import { useLockerVecrvUser } from '@/dao/entities/locker-vecrv-user'
import { networksIdMapper } from '@/dao/networks'
import type { NetworkUrlParams } from '@/dao/types/dao.types'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { ConnectWalletPrompt } from '@evm-ui/features/connect-wallet/ui/ConnectWalletPrompt'
import { EvmErrorMessage } from '@evm-ui/shared/ui/EvmErrorMessage'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Metric } from '@ui/components/Metric'
import { formatCategory } from '@ui/components/metric.utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { FormPlacementProvider } from '@ui/features/form-context/FormPlacementProvider'
import { FormSkeleton } from '@ui/features/forms/tabs/FormSkeleton'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useParams } from '@ui/hooks/router'
import { amount } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'
import { FormCrvLocker } from './components/FormCrvLocker'

const { MaxWidth, Spacing } = SizesAndSpaces
const METRIC_CATEGORY = 'dao.veCrvHeader'

export const VeCrv = () => {
  const { curveApi } = useCurve()
  const { network } = useParams<NetworkUrlParams>()
  const { address: userAddress } = useConnection()
  const chainId = networksIdMapper[network]
  const userVeCrv = useLockerVecrvUser({ chainId, userAddress })
  const showMetrics = userAddress && Number(userVeCrv.data?.lockedCrv) > 0
  const { data, error, isLoading } = useLockerLockedAmountAndUnlockTime(
    { chainId, userAddress },
    curveApi?.chainId === chainId,
  )
  return (
    <FormPlacementProvider placement="inline">
      <Stack data-testid="vecrv-page" sx={{ gap: Spacing.lg, marginInline: Spacing.md, marginBlockStart: Spacing.md }}>
        {showMetrics && (
          <MetricsGrid data-testid="vecrv-metrics" variant="fillMobile">
            <Metric
              category={METRIC_CATEGORY}
              label={t`Your voting power`}
              value={mapQuery(userVeCrv, ({ veCrv }) => amount(veCrv))}
              valueOptions={{ ...formatCategory('token.amount'), unit: { symbol: 'veCRV', position: 'suffix' } }}
              notional={mapQuery(userVeCrv, ({ lockedCrv }) => formatToken(amount(lockedCrv), 'CRV', 'amount'))}
            />
            <Metric
              category={METRIC_CATEGORY}
              label={t`Lock end`}
              value={mapQuery(userVeCrv, ({ unlockTime }) => unlockTime)}
              valueOptions={{ ...formatCategory('date') }}
            />
            <Metric
              category={METRIC_CATEGORY}
              label={t`Your share of veCRV`}
              value={mapQuery(userVeCrv, ({ veCrvPct }) => amount(veCrvPct))}
              valueOptions={{ ...formatCategory('percent.value') }}
            />
          </MetricsGrid>
        )}
        <Box sx={{ maxWidth: MaxWidth.actionCard, marginInline: 'auto' }}>
          {data && <FormCrvLocker chainId={chainId} {...data} />}
          {isLoading && <FormSkeleton />}
          {error && <EvmErrorMessage title={t`Locker Error`} error={error} />}
          {!userAddress && <ConnectWalletPrompt description={t`Please connect your wallet to view your locked CRV.`} />}
        </Box>
      </Stack>
    </FormPlacementProvider>
  )
}
