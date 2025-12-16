import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useDismissBanner } from '@ui-kit/hooks/useLocalStorage'
import { Banner, BannerProps } from '@ui-kit/shared/ui/Banner'
import { AlertType, PoolAlert } from '../types/main.types'

const ONE_DAY_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

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
  const { shouldShowBanner, dismissBanner } = useDismissBanner(poolAlertBannerKey, ONE_DAY_MS)
  const portalTarget = useMemo(() => document.getElementsByTagName('header')[0], [])
  const severity = alertTypeToBannerSeverity[alertType]

  return (
    shouldShowBanner &&
    portalTarget &&
    createPortal(
      <Banner subtitle={banner.subtitle} severity={severity} onClick={dismissBanner} learnMoreUrl={banner.learnMoreUrl}>
        {banner.title}
      </Banner>,
      portalTarget,
    )
  )
}
