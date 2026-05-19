import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'

export const BackendMaintenanceBanner = ({
  formattedDate,
  formattedTime,
  expectedDurationLabel,
  dismissBanner,
}: {
  formattedDate: string | undefined
  formattedTime: string | undefined
  dismissBanner: () => void
  expectedDurationLabel?: string
}) => (
  <Banner
    severity="alert"
    onClick={dismissBanner}
    subtitle={notFalsy(
      t`Scheduled maintenance on ${formattedDate} at ${formattedTime}. Curve's app functionality may be limited`,
      expectedDurationLabel && t`, and the price API may be unavailable for ${expectedDurationLabel}`,
      t`. This affects all users.`,
    ).join('')}
    testId={`backend-maintenance-banner`}
  >
    {t`Scheduled maintenance`}
  </Banner>
)
