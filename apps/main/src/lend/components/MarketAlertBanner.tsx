import type { MarketAlert } from '@/lend/hooks/useMarketAlert'
import type { AlertType } from '@/lend/types/lend.types'
import { Banner, BannerProps } from '@ui-kit/shared/ui/Banner'

/** Maps AlertType to Banner severity */
const alertTypeToBannerSeverity: Record<AlertType, BannerProps['severity']> = {
  error: 'alert',
  danger: 'alert',
  warning: 'warning',
  info: 'info',
}

export const MarketAlertBanner = ({
  alertType,
  banner: { title, ...bannerProps },
}: {
  alertType: AlertType
  banner: NonNullable<MarketAlert['banner']>
}) => (
  <Banner {...bannerProps} severity={alertTypeToBannerSeverity[alertType]}>
    {title}
  </Banner>
)
