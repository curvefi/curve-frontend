import { ReactNode } from 'react'
import { ErrorReportModal } from '@evm-ui/features/report-error'
import { Stack, SxProps } from '@mui/material'
import type { Address } from '@primitives/address.utils'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'
import { useSwitch } from '@ui/hooks/useSwitch'
import { ReloadIcon } from '@ui/icons/ReloadIcon'
import { t } from '@ui/lib/i18n'
import { applySxProps } from '@ui/utils/mui'
import { EmptyStateCard, type EmptyStateCardProps } from './EmptyStateCard'

export const ErrorMessage = ({
  title,
  subtitle,
  error,
  refreshData,
  sx,
  size,
  userAddress,
  ...connectionProps
}: {
  title: ReactNode
  subtitle?: ReactNode
  error?: Error | string
  refreshData?: () => Promise<unknown> | void
  sx?: SxProps
  size?: EmptyStateCardProps['size']
  userAddress: Address | undefined
} & ConnectionProps) => {
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
        {...connectionProps}
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
