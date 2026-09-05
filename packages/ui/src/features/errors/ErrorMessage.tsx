import { ReactNode } from 'react'
import { Stack, SxProps } from '@mui/material'
import type { Address } from '@primitives/address.utils'
import { EmptyStateCard, EmptyStateCardProps } from '@ui/components/EmptyStateCard'
import { ErrorReportModal } from '@ui/features/report-error'
import { useSwitch } from '@ui/hooks/useSwitch'
import { ReloadIcon } from '@ui/icons/ReloadIcon'
import { t } from '@ui/lib/i18n'
import { applySxProps } from '@ui/utils/mui'

export const ErrorMessage = ({
  title,
  subtitle,
  error,
  refreshData,
  sx,
  size,
  userAddress,
}: {
  title: ReactNode
  subtitle?: ReactNode
  error?: Error | string
  refreshData?: () => Promise<unknown> | void
  sx?: SxProps
  size?: EmptyStateCardProps['size']
  userAddress: Address | undefined
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
      <ErrorReportModal
        isOpen={isReportOpen}
        onClose={closeReportModal}
        context={{ error, title, subtitle }}
        userAddress={userAddress}
      />
    </Stack>
  )
}
