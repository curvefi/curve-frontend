import '@/global-extensions'
import { HeadContent } from '@tanstack/react-router'
import { MaintenancePage } from '@ui-kit/features/maintenance/components/MaintenancePage'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'

export const MaintenanceApp = () => {
  const theme = useUserProfileStore(state => state.theme)
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary title={t`Maintenance page error`}>
        <HeadContent />
        <MaintenancePage />
      </ErrorBoundary>
    </ThemeProvider>
  )
}
