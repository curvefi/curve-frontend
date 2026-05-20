import type { BackendMaintenanceConfig } from '@ui-kit/features/maintenance/hooks/useBackendMaintenance'
import { t } from '@ui-kit/lib/i18n'

/** Planned backend maintenance date. Past dates are ignored by the hook. */
export const BACKEND_MAINTENANCE: BackendMaintenanceConfig = {
  dateISO: '2026-05-25T07:00:00.000Z', // 25 May 2026, 09h00 CEST
  warnBefore: 'week',
  expectedDurationLabel: t`20 minutes to 1 hour`,
}
