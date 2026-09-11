import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { TokenIcon } from '@ui/components/TokenIcon'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
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
    title={
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <TokenIcon blockchainId="ethereum" address={underlyingCoinAddresses[0]} />
        {underlyingCoins[0]}
      </Stack>
    }
    action={
      <Stack sx={{ marginBottom: Spacing.xs }}>
        <PegChip status={pegStatus(rate)} />
      </Stack>
    }
  />
)
