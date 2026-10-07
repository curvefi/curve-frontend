import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TokenIcon } from '@ui/components/TokenIcon'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { type MigrationProtocol, PROTOCOL_LOGO_TOKENS } from '../migration.utils'

const { Spacing } = SizesAndSpaces

export const MigrationTableTitle = ({ title, protocol }: { title: string; protocol: MigrationProtocol }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs, paddingBlockEnd: Spacing.sm }}>
    <TokenIcon blockchainId="ethereum" address={PROTOCOL_LOGO_TOKENS[protocol]} size="mui-sm" />
    <Typography variant="headingXsBold">{title}</Typography>
  </Stack>
)
