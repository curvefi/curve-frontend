import type { ReactNode } from 'react'
import { AlertType } from '@ui/AlertBox/types'
import { Banner, type BannerProps } from '@ui-kit/shared/ui/Banner'

export type MarketBannerAlert = {
  // TODO: move alertType to ui-kit and refactor lend/loan/dex etc alertType
  alertType: AlertType
  banner: Omit<BannerProps, 'children'> & { title: ReactNode }
}

const alertTypeToBannerSeverity: Record<MarketBannerAlert['alertType'], BannerProps['severity']> = {
  error: 'alert',
  danger: 'alert',
  warning: 'warning',
  info: 'info',
  '': undefined,
}

export const MarketAlertBanner = ({ alertType, banner: { title, ...bannerProps } }: MarketBannerAlert) => (
  <Banner {...bannerProps} severity={alertTypeToBannerSeverity[alertType]}>
    {title}
  </Banner>
)
