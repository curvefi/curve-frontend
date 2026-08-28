import { TokenInfo } from '@evm-ui/shared/ui/TokenInfo'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
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
        blockchainId={pool.network}
        iconPosition="right"
        iconSize="mui-sm"
        primary={symbol}
      />
    ))}
  </Stack>
)
