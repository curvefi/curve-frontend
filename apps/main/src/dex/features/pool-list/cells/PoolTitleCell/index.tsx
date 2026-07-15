import { memo, useMemo } from 'react'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { UserPositionIndicator } from '@ui-kit/shared/ui/DataTable/UserPositionIndicator'
import { TokenIcons } from '@ui-kit/shared/ui/TokenIcons'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketTitle } from '@ui-kit/widgets/MarketTitle'
import type { PoolListItem } from '../../pools.types'
import { PoolAlertBadge } from './PoolAlertBadge'
import { PoolAlertIcons } from './PoolAlertIcons'
import { PoolTokens } from './PoolTokens'

const { Spacing, Height } = SizesAndSpaces
type PoolListTitleProps = {
  filterValue: string | undefined
  pool: PoolListItem
}

export const PoolTitleCell = ({
  row: { original: pool },
  column: { getFilterValue },
}: CellContext<PoolListItem, string>) => (
  <PoolListTitle pool={pool} filterValue={getFilterValue() as string | undefined} />
)

// Title cells do alert lookup and token icon rendering. Memoization avoids repeating that work for unchanged rows.
const PoolListTitle = memo(function PoolListTitle({ pool, filterValue }: PoolListTitleProps) {
  const tokenList = pool.coins
  const tokenAddresses = useMemo(() => tokenList.map(({ address }) => address), [tokenList])
  const poolAlert = usePoolAlert({
    network: pool.network,
    poolAddress: pool.address,
    hasVyperVulnerability: pool.hasVyperVulnerability,
  })
  const tokenAlert = useTokenAlert(tokenAddresses)

  return (
    <Stack direction="row" sx={{ height: Height.row }}>
      {pool.hasPosition && <UserPositionIndicator tooltipTitle={t`You have a balance in this pool`} />}
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <TokenIcons blockchainId={pool.network} tokens={tokenList} />
        <Stack direction="column">
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
            <PoolAlertIcons poolAlert={poolAlert} tokenAlert={tokenAlert} />
            <MarketTitle url={pool.url} address={pool.address} title={pool.name} addressLabel={t`pool`} />
          </Stack>
          <PoolTokens tokenList={tokenList} filterValue={filterValue} />
        </Stack>
      </Stack>
      {poolAlert && <PoolAlertBadge alert={poolAlert} />}
    </Stack>
  )
})
