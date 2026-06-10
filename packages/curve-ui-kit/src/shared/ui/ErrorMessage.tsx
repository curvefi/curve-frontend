import { Stack, SxProps, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { ErrorReportModal } from '@ui-kit/features/report-error'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps } from '@ui-kit/utils'

const { Spacing, IconSize, MaxWidth } = SizesAndSpaces

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
    <Stack
      sx={applySxProps(
        {
          flexDirection: 'column',
          alignItems: 'center',
          gap: Spacing.sm,
          padding: Spacing.md,
        },
        sx,
      )}
    >
      <LlamaIcon sx={{ width: IconSize.xxl, height: IconSize.xxl }} />
      <Stack sx={{ alignItems: 'center' }}>
        <Typography variant="headingXsBold" sx={{ maxWidth: MaxWidth.emptyStateCard, textAlign: 'center' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="bodySRegular"
            sx={{
              maxWidth: MaxWidth.emptyStateCard,
              textAlign: 'center',
              color: t => t.design.Text.TextColors.Secondary,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: Spacing.sm, alignItems: 'center' }}>
        <Button onClick={openReportModal} color="secondary" data-testid="submit-error-report-button">
          {t`Submit error report`}
        </Button>
        {refreshData && (
          <IconButton
            size="small"
            onClick={() => {
              void refreshData()
            }}
          >
            <ReloadIcon />
          </IconButton>
        )}
      </Stack>
      <ErrorReportModal
        isOpen={isReportOpen}
        onClose={closeReportModal}
        context={{ error, title, subtitle: errorMessage }}
      />
    </Stack>
  )
}
