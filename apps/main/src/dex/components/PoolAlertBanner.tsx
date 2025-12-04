import Stack from '@mui/material/Stack'
import { useDismissBanner } from '@ui-kit/hooks/useLocalStorage'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolAlert } from '../types/main.types'

const { IconSize } = SizesAndSpaces

const ONE_DAY_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

const PoolAlertBanner = ({
  poolAlert,
  poolAlertBannerKey,
}: {
  poolAlert: PoolAlert | null
  poolAlertBannerKey: string
}) => {
  const { shouldShowBanner, dismissBanner } = useDismissBanner(poolAlertBannerKey, ONE_DAY_MS)

  if (poolAlert?.banner)
    return (
      shouldShowBanner && (
        <Stack>
          <Banner
            subtitle={poolAlert.banner.subtitle}
            severity="alert"
            onClick={dismissBanner}
            learnMoreUrl={poolAlert.banner.learnMoreUrl}
          >
            <ExclamationTriangleIcon sx={{ width: IconSize.sm, height: IconSize.sm, verticalAlign: 'text-bottom' }} />{' '}
            {poolAlert.banner.title}
          </Banner>
        </Stack>
      )
    )
}

export default PoolAlertBanner
