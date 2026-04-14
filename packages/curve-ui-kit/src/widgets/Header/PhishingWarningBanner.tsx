import { useDismissPhishingWarn } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { isPreviewHost } from '@ui-kit/utils'

const URL = 'https://www.curve.finance'

/**
 * Displays a banner warning users about phishing risks and encourages them to verify they are on the official Curve domains.
 * The banner will reappear after one month if dismissed.
 */
export const PhishingWarningBanner = () => {
  const [shouldShowBanner, dismissBanner] = useDismissPhishingWarn()

  return (
    // hide banner for preview URLs
    !isPreviewHost &&
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
