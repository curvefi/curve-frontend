import Portal from '@mui/material/Portal'
import type { Address } from '@primitives/address.utils'
import { Banner, BannerProps } from '@ui/features/banners/Banner'
import { useDismissPoolBanner } from '@ui/features/storage/useLocalStorage'
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
  poolAddress,
  network,
}: {
  banner: NonNullable<PoolAlert['banner']>
  alertType: AlertType
  poolAddress: Address
  network: string
}) => {
  const [shouldShowBanner, dismissBanner] = useDismissPoolBanner(network, poolAddress)
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
