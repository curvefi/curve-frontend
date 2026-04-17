import Portal from '@mui/material/Portal'
import { useDismissPoolBanner } from '@ui-kit/hooks/useLocalStorage'
import { Banner, BannerProps } from '@ui-kit/shared/ui/Banner'
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
  alertType,
  poolId,
  network,
}: {
  banner: NonNullable<PoolAlert['banner']>
  alertType: AlertType
  poolId: string
  network: string
}) => {
  const [shouldShowBanner, dismissBanner] = useDismissPoolBanner(network, poolId)
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
