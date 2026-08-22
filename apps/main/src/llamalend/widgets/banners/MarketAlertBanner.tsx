import type { ReactNode } from 'react'
import { Banner, type BannerProps } from '@evm-ui/shared/ui/Banner'
import { AlertType } from '@legacy-ui/AlertBox/types'

export type MarketBannerAlert = {
  // TODO: move alertType to evm-ui and refactor lend/loan/dex etc alertType
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
