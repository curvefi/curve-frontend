import Box from '@mui/material/Box'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PegKeeperDetails, Pool } from '../types'
import { PegChip, pegStatus } from './PegChip'

const { Spacing } = SizesAndSpaces

type Props = {
  underlyingCoins: Pool['underlyingCoins']
  underlyingCoinAddresses: Pool['underlyingCoinAddresses']
  rate: PegKeeperDetails['rate']
}

export const PegKeeperHeader = ({ underlyingCoins, underlyingCoinAddresses, rate }: Props) => (
  <CardHeader
    avatar={
      <TokenPair
        chain="ethereum"
        assets={{
          primary: { symbol: underlyingCoins[0], address: underlyingCoinAddresses[0] },
          secondary: { symbol: underlyingCoins[1], address: underlyingCoinAddresses[1] },
        }}
        hideChainIcon
      />
    }
    title={
      <Stack direction="row" alignItems="center">
        {underlyingCoins[0]}
        {/** Box is needed to apply sx styling and adjust the chip's position; Chips don't support sx */}
        <Box
          sx={{
            position: 'absolute',
            right: Spacing.md,
            top: Spacing.sm,
            display: 'flex', // Block displays have lineheight which add whitespace
          }}
        >
          <PegChip status={pegStatus(rate)} />
        </Box>
      </Stack>
    }
    sx={{ position: 'relative' }}
  />
)
