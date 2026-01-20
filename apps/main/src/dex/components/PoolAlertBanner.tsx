import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
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
  const isDesktop = useIsDesktop()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- isDesktop triggers re-query when header changes (desktop ↔ mobile)
  const portalTarget = useMemo(() => document.getElementsByTagName('header')[0], [isDesktop])
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
