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

export const ErrorMessage = ({
  title,
  subtitle,
  error,
  refreshData,
  sx,
}: {
  title: string
  subtitle: string
  error?: unknown
  refreshData?: () => void
  sx?: SxProps
}) => {
  const [isReportOpen, openReportModal, closeReportModal] = useSwitch(false)

  return (
    <Stack direction="column" alignItems="center" gap={Spacing.sm} sx={sx}>
      <LlamaIcon sx={{ width: IconSize.xxl, height: IconSize.xxl }} />
      <Typography variant="bodyMRegular" color="textPrimary" textAlign="center" component="div">
        {title}
      </Typography>
      <Typography variant="bodySRegular" color="textPrimary" textAlign="center" component="div">
        {subtitle}
      </Typography>
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
      <ErrorReportModal isOpen={isReportOpen} onClose={closeReportModal} context={{ error, title, subtitle }} />
    </Stack>
  )
}
