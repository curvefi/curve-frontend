import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDismissBanner } from '@ui-kit/hooks/useLocalStorage'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { PoolAlert } from '../types/main.types'

export const DEX_POOL_ALERT_BANNER_PORTAL_ID = 'dex-pool-alert-banner-portal'

const ONE_DAY_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

const PoolAlertBanner = ({
  banner,
  poolAlertBannerKey,
}: {
  banner: NonNullable<PoolAlert['banner']>
  poolAlertBannerKey: string
}) => {
  const { shouldShowBanner, dismissBanner } = useDismissBanner(poolAlertBannerKey, ONE_DAY_MS)
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalEl(document.getElementById(DEX_POOL_ALERT_BANNER_PORTAL_ID))
  }, [])

  const content = (
    <Banner subtitle={banner.subtitle} severity="alert" onClick={dismissBanner} learnMoreUrl={banner.learnMoreUrl}>
      {banner.title}
    </Banner>
  )

  if (!shouldShowBanner) return null
  return portalEl ? createPortal(content, portalEl) : content
}

export default PoolAlertBanner
