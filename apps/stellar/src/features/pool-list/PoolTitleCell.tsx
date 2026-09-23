import { asStellarContract, shortenAddress } from '@/stellar/features/connect-wallet/address'
import type { Pool } from '@/stellar/features/pool-list/usePoolList'
import { StellarUrls } from '@/stellar/routes/routes'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RouterLink } from '@ui/components/RouterLink'
import { TokenIcons } from '@ui/components/TokenIcons'
import { CLICKABLE_IN_ROW_CLASS } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'

const { Spacing, Height } = SizesAndSpaces

export const PoolTitleCell = ({ pool: { name, address, network, coins } }: { pool: Pool }) => (
  <Stack sx={{ minHeight: Height.row, justifyContent: 'center' }}>
    <Typography variant={useIsMobile() ? 'tableCellMBold' : 'tableCellL'}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <TokenIcons blockchainId={network} tokens={coins} showTooltips={false} />
        <Stack direction="column" sx={{ justifyContent: 'center', gap: Spacing.xxs }}>
          <RouterLink
            href={StellarUrls.pool({ network, pool: asStellarContract(address) })}
            color="inherit"
            underline="none"
            className={CLICKABLE_IN_ROW_CLASS}
          >
            {name || shortenAddress(asStellarContract(address))}
          </RouterLink>
        </Stack>
      </Stack>
    </Typography>
  </Stack>
)
