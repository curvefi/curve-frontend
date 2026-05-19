import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDate, formatTime } from '@ui/utils/utilsDate'
import { useDismissBackendMaintenance } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BackendMaintenanceConfig } from './backend-maintenance.constants'

const { Spacing } = SizesAndSpaces

const getDateAndTime = (dateISO: string) => {
  const date = new Date(dateISO)
  return {
    date: formatDate(date),
    time: formatTime(date, { second: undefined, hour12: true, timeZoneName: 'short' }),
  }
}

export const BackendMaintenanceModal = ({ dateISO, expectedDuration }: BackendMaintenanceConfig) => {
  const [isDismissed, setIsDismissed] = useDismissBackendMaintenance(dateISO)
  const { date, time } = getDateAndTime(dateISO)
  // we display the modal once and only before the scheduled maintance time
  const showModal = !isDismissed && new Date(dateISO).getTime() > Date.now()

  const dismissModal = () => setIsDismissed(true)

  return (
    showModal && (
      <ModalDialog
        open
        onClose={dismissModal}
        title={t`Upcoming maintenance`}
        footer={
          <Button fullWidth onClick={dismissModal} data-testid="backend-maintenance-modal-dismiss">
            {t`I understand`}
          </Button>
        }
        compact
      >
        <Stack spacing={Spacing.md}>
          <Typography variant="bodyMRegular" color="textSecondary">
            {t`Curve's backend will undergo scheduled maintenance on ${date} at ${time} as part of a production database upgrade.`}
          </Typography>
          <Typography variant="bodyMRegular" color="textSecondary">
            {t`During this period, the app may have limited functionality and the price API may be unavailable. This will affect all users, including LPs, borrowers, and lenders.`}
          </Typography>
          {expectedDuration && (
            <Typography variant="bodyMRegular" color="textSecondary">
              {t`Expected duration: ${expectedDuration}.`}
            </Typography>
          )}
          <Typography variant="bodyMRegular" color="textSecondary">
            {t`This is planned maintenance, not a security incident. Please plan accordingly.`}
          </Typography>
        </Stack>
      </ModalDialog>
    )
  )
}
