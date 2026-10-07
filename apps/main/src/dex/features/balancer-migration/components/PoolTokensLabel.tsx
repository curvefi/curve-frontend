import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TokenIcons, type TokenIconsProps } from '@ui/components/TokenIcons'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/** Token selector label showing the pool's tokens, as the migration tables do. */
export const PoolTokensLabel = ({
  blockchainId,
  tokens,
  label,
}: Pick<TokenIconsProps, 'blockchainId' | 'tokens'> & { label: string }) => (
  <Stack direction="row" sx={{ gap: Spacing.sm, alignItems: 'center', minWidth: 0 }}>
    <TokenIcons blockchainId={blockchainId} tokens={tokens} />
    <Typography variant="bodyMBold" noWrap>
      {label}
    </Typography>
  </Stack>
)
