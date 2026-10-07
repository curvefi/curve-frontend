import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { TokenIconsProps } from '@ui/components/TokenIcons'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { MigrationProtocol } from '../migration.utils'
import { ProtocolPoolIcons } from './ProtocolPoolIcons'

const { Spacing } = SizesAndSpaces

/** Token selector label showing the pool's tokens, as the migration tables do. */
export const PoolTokensLabel = ({
  blockchainId,
  tokens,
  protocol,
  label,
}: Pick<TokenIconsProps, 'blockchainId' | 'tokens'> & { protocol: MigrationProtocol; label: string }) => (
  <Stack direction="row" sx={{ gap: Spacing.sm, alignItems: 'center', minWidth: 0 }}>
    <ProtocolPoolIcons blockchainId={blockchainId} tokens={tokens} protocol={protocol} />
    <Typography variant="bodyMBold" noWrap>
      {label}
    </Typography>
  </Stack>
)
