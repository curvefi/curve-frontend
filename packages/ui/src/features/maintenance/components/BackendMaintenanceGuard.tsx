import type { ReactNode } from 'react'
import { BackendMaintenanceModal } from '@ui/features/maintenance/components/BackendMaintenanceModal'
import { MaintenancePage } from '@ui/features/maintenance/components/MaintenancePage'
import type { Maintenance } from '@ui/features/maintenance/hooks/useMaintenance'
import { IS_CYPRESS } from '@ui/lib/env'

export const BackendMaintenanceGuard = ({
  maintenance,
  children,
}: {
  maintenance: Maintenance
  children: ReactNode
}) => (
  <>
    {maintenance.isMaintenanceMode ? <MaintenancePage /> : children}
    {!IS_CYPRESS && <BackendMaintenanceModal {...maintenance} />}
  </>
)
