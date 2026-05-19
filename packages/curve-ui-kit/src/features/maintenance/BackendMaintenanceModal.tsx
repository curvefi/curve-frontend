import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const BackendMaintenanceModal = ({
  formattedDate,
  formattedTime,
  expectedDurationLabel,
  showModal,
  dismissModal,
}: {
  formattedDate: string | undefined
  formattedTime: string | undefined
  dismissModal: () => void
  showModal: boolean
  expectedDurationLabel?: string
}) => (
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
      <Typography variant="bodyMRegular" color="textSecondary">
        {t`Curve's backend will undergo scheduled maintenance on ${formattedDate} at ${formattedTime} as part of a production database upgrade.`}
      </Typography>
      <Typography variant="bodyMRegular" color="textSecondary">
        {t`During this period, the app may have limited functionality and the price API may be unavailable. This will affect all users, including LPs, borrowers, and lenders.`}
      </Typography>
      {expectedDurationLabel && (
        <Typography variant="bodyMRegular" color="textSecondary">
          {t`Expected duration: ${expectedDurationLabel}.`}
        </Typography>
      )}
      <Typography variant="bodyMRegular" color="textSecondary">
        {t`This is planned maintenance, not a security incident. Please plan accordingly.`}
      </Typography>
    </Stack>
  </ModalDialog>
)
