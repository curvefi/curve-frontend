import { ReactNode } from 'react'
import { ErrorReportModal } from '@evm-ui/features/report-error'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t } from '@evm-ui/lib/i18n'
import { ReloadIcon } from '@evm-ui/shared/icons/ReloadIcon'
import { applySxProps } from '@evm-ui/utils'
import { Stack, SxProps } from '@mui/material'
import { EmptyStateCard, EmptyStateCardProps } from './EmptyStateCard'

export const ErrorMessage = ({
  title,
  subtitle,
  error,
  refreshData,
  sx,
  size,
}: {
  title: ReactNode
  subtitle?: ReactNode
  error?: Error | string
  refreshData?: () => Promise<unknown> | void
  sx?: SxProps
  size?: EmptyStateCardProps['size']
}) => {
  const [isReportOpen, openReportModal, closeReportModal] = useSwitch(false)

  return (
    <Stack sx={applySxProps({ alignItems: 'center' }, sx)}>
      <EmptyStateCard
        title={title}
        description={subtitle}
        size={size}
        button={{ label: t`Submit error report`, testId: 'submit-error-report-button', onClick: openReportModal }}
        {...(refreshData && {
          secondaryButton: {
            label: t`Reload`,
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
