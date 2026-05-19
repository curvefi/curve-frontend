import { t } from '@ui-kit/lib/i18n'

export type BackendMaintenanceConfig = {
  // UTC ISO string date of the scheduled backend maintenance
  dateISO: string
  // optional information to display in the modal and the banner
  expectedDuration?: string
}

export const BACKEND_MAINTENANCE_CONFIG: BackendMaintenanceConfig = {
  dateISO: '2026-05-24T12:00:00.000Z', // 24 May 2026, 14h00 CEST
  expectedDuration: t`20 minutes to 1 hour`,
}
