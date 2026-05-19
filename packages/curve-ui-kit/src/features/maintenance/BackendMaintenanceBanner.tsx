import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { useBackendMaintenance } from './hooks/useBackendMaintenance'

export const BackendMaintenanceBanner = () => {
  const { formattedDate, formattedTime, expectedDurationLabel, showBanner, dismissBanner } = useBackendMaintenance()

  return (
    showBanner && (
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
  )
}
