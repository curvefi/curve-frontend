import { Stack, SxProps } from '@mui/material'
import IconButton from '@mui/material/IconButton'
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
  errorMessage,
  refreshData,
  sx,
}: {
  title: string
  subtitle?: string
  error?: Error | string
  errorMessage: string
  refreshData?: () => Promise<unknown> | void
  sx?: SxProps
}) => {
  const [isReportOpen, openReportModal, closeReportModal] = useSwitch(false)

  return (
    <Stack sx={applySxProps({ alignItems: 'center' }, sx)}>
      <EmptyStateCard
        title={title}
        subtitle={subtitle}
        button={{ label: t`Submit error report`, testId: 'submit-error-report-button', onClick: openReportModal }}
        rightAction={
          refreshData && (
            <IconButton
              size="small"
              onClick={() => {
                void refreshData()
              }}
            >
              <ReloadIcon />
            </IconButton>
          )
        }
      />
      <ErrorReportModal
        isOpen={isReportOpen}
        onClose={closeReportModal}
        context={{ error, title, subtitle: errorMessage }}
      />
    </Stack>
  )
}
