import { ROUTE } from '@/dex/constants'
import { getPath } from '@/dex/utils/utilsRouter'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { TableExpandedPanel } from '@ui-kit/shared/ui/DataTable/TableExpandedPanel'
import { Metric, type MetricProps } from '@ui-kit/shared/ui/Metric'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { PoolListRewards } from '../cells/PoolListRewards'
import { PoolListColumnId } from '../columns/column.enum'
import type { PoolListItem } from '../poolList.types'
import { getPoolYieldApy } from '../poolList.utils'

const { Spacing } = SizesAndSpaces

const ListInfoItem = ({
  value,
  ...props
}: Omit<MetricProps, 'value' | 'category'> & { value: number | string | undefined | null }) => (
  <Grid size={6}>
    <Metric category="dex.poolListMobileExpanded" value={constQ(decimal(value) ?? null)} {...props} />
  </Grid>
)

const highlight = { color: 'success' as const }

export const PoolListMobileExpandedPanel: ExpandedPanel<PoolListItem> = ({ row, table, category }) => {
  const pool = row.original
  const path = getPath({ network: pool.network }, `${ROUTE.PAGE_POOLS}/${pool.address}`)
  const hasVolume = table.getColumn(PoolListColumnId.Volume)?.getIsVisible()

  return (
    <TableExpandedPanel
      category={category}
      footer={
        <>
          <Button data-testid="pool-link-deposit" component={RouterLink} href={path + ROUTE.PAGE_POOL_DEPOSIT}>
            {t`Deposit`}
          </Button>
          <Button component={RouterLink} href={path + ROUTE.PAGE_POOL_WITHDRAW}>
            {t`Withdraw`}
          </Button>
          <Button component={RouterLink} href={path + ROUTE.PAGE_SWAP}>
            {t`Swap`}
          </Button>
        </>
      }
    >
      <Grid
        container
        spacing={Spacing.md}
        sx={{
          paddingBlockStart: Spacing.md, //temporary padding, should be using card header
        }}
      >
        {hasVolume && (
          <ListInfoItem
            label={t`24h Volume`}
            value={pool.tradingVolume24h}
            valueOptions={{
              unit: 'dollar',
              ...(table.getColumn(PoolListColumnId.Volume)?.getIsSorted() && highlight),
            }}
          />
        )}
        <ListInfoItem
          label={t`TVL`}
          value={pool.tvlUsd}
          valueOptions={{
            unit: 'dollar',
            ...(table.getColumn(PoolListColumnId.Tvl)?.getIsSorted() && highlight),
          }}
        />
        <ListInfoItem
          label={t`BASE vAPY`}
          value={getPoolYieldApy(pool.baseDailyApr)}
          valueOptions={{
            unit: 'percentage',
            ...(table.getColumn(PoolListColumnId.RewardsBase)?.getIsSorted() && highlight),
          }}
        />
        <Grid size={6}>
          <PoolListRewards pool={pool} mobile />
        </Grid>
      </Grid>
    </TableExpandedPanel>
  )
}
