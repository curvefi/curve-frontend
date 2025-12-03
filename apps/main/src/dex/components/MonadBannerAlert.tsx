import { Banner } from '@ui-kit/shared/ui/Banner'
import { Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { PoolUrlParams } from '../types/main.types'

const MonadBannerAlert = ({ params }: { params: PoolUrlParams }) => {
  const showFactoryStableNg11Banner = params.pool === 'factory-stable-ng-11' && params.network === 'monad'

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
