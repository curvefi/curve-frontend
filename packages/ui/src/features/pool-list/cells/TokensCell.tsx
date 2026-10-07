import Stack from '@mui/material/Stack'
import { TokenInfo } from '@ui/components/TokenInfo'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { PoolRow } from '../types'

const { Spacing } = SizesAndSpaces

export const TokensCell = ({ pool }: { pool: PoolRow }) => (
  <Stack
    direction="row-reverse"
    data-testid="pool-tokens"
    sx={{ flexWrap: 'wrap', columnGap: Spacing.sm, rowGap: Spacing.xs }}
  >
    {pool.tradeableCoins.map(({ address, symbol }) => (
      <TokenInfo
        key={address}
        address={address}
        blockchainId={pool.blockchainId}
        iconPosition="right"
        iconSize="mui-sm"
        primary={symbol}
      />
    ))}
  </Stack>
)
