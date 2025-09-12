import Box from '@mui/material/Box'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PegKeeperDetails, Pool } from '../types'
import { pegStatus } from './peg-status.util'
import { PegChip } from './PegChip'

const { Spacing } = SizesAndSpaces

type Props = {
  underlyingCoins: Pool['underlyingCoins']
  underlyingCoinAddresses: Pool['underlyingCoinAddresses']
  rate: PegKeeperDetails['rate']
}

export const PegKeeperHeader = ({ underlyingCoins, underlyingCoinAddresses, rate }: Props) => (
  <CardHeader
    avatar={
      <TokenIcon
        blockchainId="ethereum"
        address={underlyingCoinAddresses[0]}
        sx={{
          // Default space between avatar and card header content is a bit too big for this specific card, so we reduce it by half
          '--avatar-margin-right': Spacing.md,
          marginRight: 'calc(-1 * var(--avatar-margin-right) / 2)',
        }}
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
            top: Spacing.md,
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
