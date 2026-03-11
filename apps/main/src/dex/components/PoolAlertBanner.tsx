import Portal from '@mui/material/Portal'
import { useDismissBanner } from '@ui-kit/hooks/useLocalStorage'
import { Banner, BannerProps } from '@ui-kit/shared/ui/Banner'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { AlertType, PoolAlert } from '../types/main.types'

/** Maps AlertType to BannerSeverity  */
const alertTypeToBannerSeverity: Record<AlertType, BannerProps['severity']> = {
  error: 'alert',
  danger: 'alert',
  warning: 'warning',
  info: 'info',
  '': 'info',
}

export const PoolAlertBanner = ({
  banner,
  poolAlertBannerKey,
  alertType,
}: {
  banner: NonNullable<PoolAlert['banner']>
  poolAlertBannerKey: string
  alertType: AlertType
}) => {
  const { shouldShowBanner, dismissBanner } = useDismissBanner(poolAlertBannerKey, Duration.Banner.Daily)
  const severity = alertTypeToBannerSeverity[alertType]

  return (
    shouldShowBanner && (
      <Portal container={() => document.getElementsByTagName('header').item(0)}>
        <Banner
          subtitle={banner.subtitle}
          severity={severity}
          onClick={dismissBanner}
          learnMoreUrl={banner.learnMoreUrl}
        >
          {banner.title}
        </Banner>
      </Portal>
    )
  )
}
