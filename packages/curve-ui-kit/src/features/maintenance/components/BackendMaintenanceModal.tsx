import { ReactNode } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import MuiTypography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Maintenance } from '../hooks/useMaintenance'

const { Spacing } = SizesAndSpaces

const Typography = ({ children }: { children: ReactNode }) => (
  <MuiTypography color="textSecondary">{children}</MuiTypography>
)

export const BackendMaintenanceModal = ({
  formattedDate,
  formattedTime,
  expectedDurationLabel,
  showModal,
  dismissModal,
  learnMoreLink,
}: Maintenance) => (
  <ModalDialog
    open={showModal}
    onClose={dismissModal}
    title={t`Upcoming maintenance`}
    testId="backend-maintenance-modal"
    footer={
      <Button fullWidth onClick={dismissModal} data-testid="backend-maintenance-modal-dismiss">
        {t`I understand`}
      </Button>
    }
    compact
  >
    <Stack spacing={Spacing.md}>
      <Typography>
        {t`Curve’s app is scheduled for routine maintenance on ${formattedDate} at ${formattedTime} as part of a production database upgrade.`}
      </Typography>
      <Typography>
        {t`During this window, some app features and price data may be temporarily unavailable or slower to update than usual. `}
      </Typography>
      {expectedDurationLabel && <Typography>{t`Expected duration: ${expectedDurationLabel}.`}</Typography>}
      <Typography>
        {t`Underlying smart contracts will continue to operate normally. This maintenance only affects parts of the app experience.`}
      </Typography>
      <Typography>{t`Thank you for your patience.`}</Typography>
      {learnMoreLink && (
        <Stack direction="row" justifyContent="end">
          <ExternalLink href={learnMoreLink} label={t`Learn more`} size="small" />
        </Stack>
      )}
    </Stack>
  </ModalDialog>
)
