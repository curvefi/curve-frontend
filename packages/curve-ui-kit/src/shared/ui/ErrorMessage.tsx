import { ReactNode } from 'react'
import { Stack, SxProps } from '@mui/material'
import { ErrorReportModal } from '@ui-kit/features/report-error'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { applySxProps } from '@ui-kit/utils'
import { EmptyStateCard } from './EmptyStateCard'

export const ErrorMessage = ({
  title,
  subtitle,
  error,
  refreshData,
  sx,
}: {
  title: ReactNode
  subtitle?: ReactNode
  error?: Error | string
  refreshData?: () => Promise<unknown> | void
  sx?: SxProps
}) => {
  const [isReportOpen, openReportModal, closeReportModal] = useSwitch(false)

  return (
    <Stack sx={applySxProps({ alignItems: 'center' }, sx)}>
      <EmptyStateCard
        title={title}
        description={subtitle}
        button={{ label: t`Submit error report`, testId: 'submit-error-report-button', onClick: openReportModal }}
        {...(refreshData && {
          secondaryButton: {
            label: 'Reload',
            startIcon: <ReloadIcon />,
            onClick: () => {
              void refreshData()
            },
          },
        })}
      />
      <ErrorReportModal isOpen={isReportOpen} onClose={closeReportModal} context={{ error, title, subtitle }} />
    </Stack>
  )
}
