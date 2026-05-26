import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { Maintenance } from '../hooks/useMaintenance'

export const BackendMaintenanceBanner = ({
  formattedDate,
  formattedTime,
  expectedDurationLabel,
  dismissBanner,
  learnMoreLink,
}: Maintenance) => (
  <Banner
    severity="alert"
    onClick={dismissBanner}
    subtitle={notFalsy(
      t`Scheduled maintenance on ${formattedDate} at ${formattedTime}. Curve's app functionality may be limited`,
      expectedDurationLabel && t`, and the price API may be unavailable for ${expectedDurationLabel}.`,
    ).join('')}
    testId={`backend-maintenance-banner`}
    learnMoreUrl={learnMoreLink}
  >
    {t`Scheduled maintenance`}
  </Banner>
)
