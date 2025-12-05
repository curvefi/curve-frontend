import { Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { usePoolIdByAddressOrId } from '../hooks/usePoolIdByAddressOrId'

const MonadBannerAlert = ({ chainId, poolIdOrAddress }: { chainId: number; poolIdOrAddress: string }) => {
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress })
  const showFactoryStableNg11Banner = poolId === 'factory-stable-ng-11'

  if (showFactoryStableNg11Banner)
    return (
      <Stack>
        <Banner severity="alert">
          {t`This pool has been misconfigured. It has been set to withdraw only. To minimize impact withdraw in balanced proportion instead of single sided.`}
        </Banner>
      </Stack>
    )
}

export default MonadBannerAlert
