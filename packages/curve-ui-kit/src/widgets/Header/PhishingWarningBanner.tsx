import { useDismissBanner } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'

const URL = 'https://www.curve.finance'
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

/**
 * Displays a banner warning users about phishing risks and encourages them to verify they are on the official Curve domains.
 * The banner will reappear after one month if dismissed.
 */
export const PhishingWarningBanner = () => {
  const { shouldShowBanner, dismissBanner } = useDismissBanner('phishing-warning-dismissed', ONE_MONTH_MS)

  return (
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
