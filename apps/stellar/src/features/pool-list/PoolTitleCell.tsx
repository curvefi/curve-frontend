import { shortenAddress } from '@/stellar/features/connect-wallet/address'
import { StellarUrls } from '@/stellar/routes/routes'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RouterLink } from '@ui/components/RouterLink'
import { CLICKABLE_IN_ROW_CLASS } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import type { FactoryPoolData } from './useFactoryPoolData'

const { Height } = SizesAndSpaces

export const PoolTitleCell = ({ pool }: { pool: FactoryPoolData }) => (
  <Stack sx={{ minHeight: Height.row, justifyContent: 'center' }}>
    <Typography variant={useIsMobile() ? 'tableCellMBold' : 'tableCellL'}>
      <RouterLink href={StellarUrls.pool(pool)} color="inherit" underline="none" className={CLICKABLE_IN_ROW_CLASS}>
        {pool.name || shortenAddress(pool.pool)}
      </RouterLink>
    </Typography>
  </Stack>
)
