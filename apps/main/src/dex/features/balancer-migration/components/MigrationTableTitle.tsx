import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { TokenIcon } from '@ui/components/TokenIcon'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/** Protocol tokens carry the protocol logos, so the token icon doubles as the section icon. */
export const MigrationTableTitle = ({ title, logoToken }: { title: string; logoToken: Address }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs, paddingBlockEnd: Spacing.sm }}>
    <TokenIcon blockchainId="ethereum" address={logoToken} size="mui-sm" />
    <Typography variant="headingXsBold">{title}</Typography>
  </Stack>
)
