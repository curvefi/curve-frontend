import type { ReactNode } from 'react'
import { Banner, type BannerProps } from '@ui-kit/shared/ui/Banner'

export type MarketBannerAlert = {
  // TODO: move alertType to ui-kit and refactor lend/loan/dex etc alertType
  alertType: 'info' | 'warning' | 'error' | 'danger'
  banner: Omit<BannerProps, 'children'> & { title: ReactNode }
}

const alertTypeToBannerSeverity: Record<MarketBannerAlert['alertType'], BannerProps['severity']> = {
  error: 'alert',
  danger: 'alert',
  warning: 'warning',
  info: 'info',
}

export const MarketAlertBanner = ({ alertType, banner: { title, ...bannerProps } }: MarketBannerAlert) => (
  <Banner {...bannerProps} severity={alertTypeToBannerSeverity[alertType]}>
    {title}
  </Banner>
)
