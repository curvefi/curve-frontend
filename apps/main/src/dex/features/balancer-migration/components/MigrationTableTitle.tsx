import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BadgeIcon } from '@ui/components/BadgeIcon'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { type MigrationProtocol, PROTOCOLS } from '../migration.utils'

const { Spacing } = SizesAndSpaces

export const MigrationTableTitle = ({ title, protocol }: { title: string; protocol: MigrationProtocol }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs, paddingBlockEnd: Spacing.sm }}>
    <BadgeIcon src={PROTOCOLS[protocol].logoUrl} alt={PROTOCOLS[protocol].name} size="md" />
    <Typography variant="headingXsBold">{title}</Typography>
  </Stack>
)
