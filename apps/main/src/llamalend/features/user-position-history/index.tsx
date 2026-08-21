import { t } from '@evm-ui/lib/i18n'
import { Accordion } from '@evm-ui/shared/ui/Accordion'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import type { QueryProp } from '@evm-ui/types/util'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'
import { UserEventsTable } from './UserEventsTable'

const { Spacing } = SizesAndSpaces

type UserPositionHistoryProps = {
  eventsQuery: QueryProp<ParsedUserCollateralEvent[]>
  variant: 'accordion' | 'flat'
}

export const UserPositionHistory = ({ eventsQuery, variant }: UserPositionHistoryProps) => (
  <WithWrapper shouldWrap={variant === 'accordion'} Wrapper={Accordion} title={t`Activity`} ghost>
    <Stack sx={{ gap: Spacing.xxs }}>
      <UserEventsTable eventsQuery={eventsQuery} />
      <Stack direction="row" sx={{ gap: Spacing.xs }}>
        <Typography variant="bodyXsRegular">
          {t`Llamelend liquidations are not price based, but health based.`}
        </Typography>
        <Typography variant="bodyXsBold" sx={{ color: t => t.design.Text.TextColors.Highlight }}>
          {t`Liquidations occur when health reaches 0.`}
        </Typography>
      </Stack>
    </Stack>
  </WithWrapper>
)
