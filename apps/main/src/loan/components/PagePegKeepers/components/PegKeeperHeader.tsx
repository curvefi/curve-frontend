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
          // Default space between avatar and card header content is a bit too big for this specific card, so we reduce it a bit
          '--avatar-margin-right': Spacing.md,
          marginRight: 'calc(-1 * var(--avatar-margin-right) / 1.25)',
        }}
      />
    }
    title={
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {underlyingCoins[0]}
        <PegChip status={pegStatus(rate)} />
      </Stack>
    }
  />
)
