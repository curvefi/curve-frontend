import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'
import { UserEventsTable } from './UserEventsTable'

const { Spacing } = SizesAndSpaces

type UserPositionHistoryProps = {
  events: ParsedUserCollateralEvent[]
  isLoading: boolean
  isError: boolean
}

export const UserPositionHistory = ({ events, isLoading, isError }: UserPositionHistoryProps) => (
  <Accordion title={t`Activity`} ghost>
    <Stack gap={Spacing.xxs}>
      <UserEventsTable events={events} loading={isLoading} isError={isError} />
      <Stack direction="row" gap={Spacing.xs}>
        <Typography variant="bodyXsRegular">
          {t`Llamelend liquidations are not price based, but health based.`}
        </Typography>
        <Typography variant="bodyXsBold" sx={{ color: (t) => t.design.Text.TextColors.Highlight }}>
          {t`Liquidations occur when health reaches 0.`}
        </Typography>
      </Stack>
    </Stack>
  </Accordion>
)
