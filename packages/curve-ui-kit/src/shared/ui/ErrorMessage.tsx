import { Stack, SxProps, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { ErrorReportModal } from '@ui-kit/features/report-error'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize } = SizesAndSpaces

const TYPOGRAPHY_MAX_WIDTH = '27.5rem' // 440px

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
  refreshData?: () => void
  sx?: SxProps
}) => {
  const [isReportOpen, openReportModal, closeReportModal] = useSwitch(false)

  return (
    <Stack flexDirection="column" alignItems="center" gap={Spacing.sm} padding={Spacing.md} sx={sx}>
      <LlamaIcon sx={{ width: IconSize.xxl, height: IconSize.xxl }} />
      <Stack alignItems="center">
        <Typography variant="headingXsBold" sx={{ maxWidth: TYPOGRAPHY_MAX_WIDTH, textAlign: 'center' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="bodySRegular"
            sx={{ maxWidth: TYPOGRAPHY_MAX_WIDTH, textAlign: 'center', color: t => t.design.Text.TextColors.Secondary }}
          >
            {subtitle}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={Spacing.sm} alignItems="center">
        <Button onClick={openReportModal} color="secondary" data-testid="submit-error-report-button">
          {t`Submit error report`}
        </Button>
        {refreshData && (
          <IconButton
            size="small"
            onClick={() => {
              refreshData()
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
