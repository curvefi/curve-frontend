import { usePhishingWarningDismissed } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces
const URL = 'https://www.curve.finance'

/**
 * Displays a banner warning users about phishing risks and encourages them to verify they are on the official Curve domains.
 * The banner will reappear after one month if dismissed.
 */
export const PhishingWarningBanner = () => {
  const { setDismissedAt, shouldShowPhishingWarning } = usePhishingWarningDismissed()

  const handleDismiss = () => {
    setDismissedAt(Date.now())
  }

  if (!shouldShowPhishingWarning) {
    return null
  }

  return (
    <Banner subtitle={t`Always carefully check that your URL is ${URL}.`} severity="warning" onClick={handleDismiss}>
      <ExclamationTriangleIcon sx={{ width: IconSize.sm, height: IconSize.sm, verticalAlign: 'text-bottom' }} />
      {t`Make sure you are on the right domain`}
    </Banner>
  )
}
