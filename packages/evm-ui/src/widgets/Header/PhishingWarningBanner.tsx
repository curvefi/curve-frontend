import { Banner } from '@ui/features/banners/Banner'
import { useDismissPhishingWarn } from '@ui/features/storage/useLocalStorage'
import { IS_PREVIEW_HOST } from '@ui/lib/env'
import { t } from '@ui/lib/i18n'

const URL = 'https://www.curve.finance'

/**
 * Displays a banner warning users about phishing risks and encourages them to verify they are on the official Curve domains.
 * The banner will reappear after one month if dismissed.
 */
export const PhishingWarningBanner = () => {
  const [shouldShowBanner, dismissBanner] = useDismissPhishingWarn()

  return (
    // hide banner for preview URLs
    !IS_PREVIEW_HOST &&
    shouldShowBanner && (
      <Banner
        subtitle={t`Always carefully check that your URL is ${URL}.`}
        severity="warning"
        onClick={dismissBanner}
        testId="phishing-warning-banner"
      >
        {t`Make sure you are on the right domain`}
      </Banner>
    )
  )
}
