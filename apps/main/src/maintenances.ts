import type { MaintenanceConfig } from '@ui-kit/features/maintenance/hooks/useMaintenance'
import { t } from '@ui-kit/lib/i18n'

/** Planned backend maintenance date. Past dates are ignored by the hook. */
export const BACKEND_MAINTENANCE: MaintenanceConfig = {
  dateISO: '2026-05-25T07:00:00.000Z', // 25 May 2026, 09h00 CEST
  warnBefore: 'week',
  expectedDurationLabel: t`20 minutes to 1 hour`,
  learnMoreLink: 'https://x.com/CurveFinance/status/2057435934526702083',
}
