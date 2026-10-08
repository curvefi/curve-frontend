import { type ReactNode, useMemo } from 'react'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Badge } from '@ui/components/Badge'
import { BadgeIcon } from '@ui/components/BadgeIcon'
import { TabsSwitcher } from '@ui/components/Tabs/TabsSwitcher'
import { Tooltip } from '@ui/components/Tooltip'
import { poolTypeClassifications } from '@ui/features/pool-list/cells/PoolTitleCell/classifications'
import { q } from '@ui/features/queries/util'
import { createAppColumnHelper, useCurveTable } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { isInRange, tickToPrice } from '../api/uniswap.api'
import type { UniswapPositionRow } from '../hooks/useUniswapPositionRows'
import {
  type CurveTarget,
  formatFeeTier,
  getTargetGauge,
  type MigrationProtocol,
  PROTOCOLS,
  UNISWAP_FEE_APR_DESCRIPTION,
} from '../migration.utils'

const { Spacing, Height } = SizesAndSpaces

/** The rows are not clickable, so nothing else gives them the table's row height. */
const cellSx = { minHeight: Height.row, alignItems: 'center', gap: Spacing.xs } as const

type ComparisonRow = { id: string; label: ReactNode; uniswap: ReactNode; curve: ReactNode }

const CURVE_REBALANCING = { stable: t`Around the peg`, volatile: t`Follows the price`, fxswap: t`Follows the FX rate` }

const formatPrice = (price: number) => formatNumber(price, { abbreviate: true, decimals: price < 10 ? 4 : 2 })

const ProtocolHeader = ({ protocol, title }: { protocol: MigrationProtocol; title: string }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs, justifyContent: 'end' }}>
    <BadgeIcon src={PROTOCOLS[protocol].logoUrl} alt="" />
    {title}
  </Stack>
)

/** Current state, in the table's secondary text. */
const Was = ({ children, badge }: { children: ReactNode; badge?: ReactNode }) => (
  <Stack direction="row" sx={{ ...cellSx, justifyContent: 'end' }}>
    <Typography variant="tableCellMRegular" color="textSecondary" noWrap>
      {children}
    </Typography>
    {badge}
  </Stack>
)

/** After the migration, emphasized. */
const Becomes = ({ children, badge }: { children: ReactNode; badge?: ReactNode }) => (
  <Stack direction="row" sx={{ ...cellSx, justifyContent: 'end' }}>
    <Typography variant="tableCellMBold" noWrap>
      {children}
    </Typography>
    {badge}
  </Stack>
)

const columnHelper = createAppColumnHelper<ComparisonRow>()
const COLUMNS = columnHelper.columns([
  columnHelper.display({
    id: 'label',
    header: '',
    cell: ({ row }) => (
      <Stack direction="row" sx={cellSx}>
        <Typography variant="tableCellMRegular">{row.original.label}</Typography>
      </Stack>
    ),
  }),
  columnHelper.display({
    id: 'uniswap',
    header: () => <ProtocolHeader protocol="uniswap" title={t`Your Uniswap position`} />,
    cell: ({ row }) => row.original.uniswap,
    meta: { type: 'numeric' },
  }),
  columnHelper.display({
    id: 'curve',
    header: () => <ProtocolHeader protocol="curve" title={t`On Curve`} />,
    cell: ({ row }) => row.original.curve,
    meta: { type: 'numeric' },
  }),
])

const getRows = (position: UniswapPositionRow, target: CurveTarget): ComparisonRow[] => {
  const [token0, token1] = position.tokens
  const [lower, upper] = [position.tickLower, position.tickUpper].map(tick =>
    formatPrice(tickToPrice(tick, position.tokens)),
  )
  const inRange = isInRange(position)
  const classification = maybe(target.row.poolType, type => poolTypeClassifications[type])
  return [
    {
      id: 'position',
      label: t`Position`,
      uniswap: <Was>{t`NFT #${position.tokenId}`}</Was>,
      curve: <Becomes>{t`${target.row.name} LP token`}</Becomes>,
    },
    {
      id: 'range',
      label: t`Price range`,
      uniswap: (
        <Was
          badge={
            <Badge
              size="extraSmall"
              color={inRange ? 'active' : 'warning'}
              label={inRange ? t`In range` : t`Out of range`}
            />
          }
        >
          {t`${lower} – ${upper} ${token1.symbol}/${token0.symbol}`}
        </Was>
      ),
      curve: <Becomes>{t`Full range`}</Becomes>,
    },
    {
      id: 'earning',
      label: t`Earns fees`,
      uniswap: <Was>{inRange ? t`Only while in range` : t`Not now, out of range`}</Was>,
      curve: <Becomes>{t`At every price`}</Becomes>,
    },
    {
      id: 'rebalancing',
      label: t`Rebalancing`,
      uniswap: <Was>{t`By hand`}</Was>,
      curve: (
        <Becomes>
          {classification ? t`Automatic, ${CURVE_REBALANCING[classification].toLowerCase()}` : t`Automatic`}
        </Becomes>
      ),
    },
    {
      id: 'fees',
      label: t`Trading fees`,
      uniswap: <Was>{t`${formatFeeTier(position.fee)} tier, claimed by hand`}</Was>,
      curve: <Becomes>{t`Compounded into the LP`}</Becomes>,
    },
    {
      id: 'rewards',
      label: t`Rewards`,
      uniswap: <Was>{t`None`}</Was>,
      curve: <Becomes>{getTargetGauge(target) ? t`CRV and rewards when staked` : t`None, no gauge`}</Becomes>,
    },
    {
      id: 'apr',
      label: (
        <Tooltip title={t`Estimated fee APR`} body={UNISWAP_FEE_APR_DESCRIPTION} placement="top">
          <span>{t`APR`}</span>
        </Tooltip>
      ),
      uniswap: <Was>{t`${formatNumber(position.feeApr, 'percent.rate')} fee APR (est.)`}</Was>,
      curve: <Becomes>{t`${formatNumber(target.row.netApr, 'percent.rate')} Net APR`}</Becomes>,
    },
  ]
}

/** What a Uniswap v3 LP gives up and gains by moving to the selected Curve pool. */
export const UniswapCurveComparison = ({ position, target }: { position: UniswapPositionRow; target: CurveTarget }) => {
  const table = useCurveTable({
    columns: COLUMNS,
    query: q({ data: useMemo(() => getRows(position, target), [position, target]), isLoading: false, error: null }),
    getRowId: ({ id }) => id,
    enableSorting: false,
  })
  return (
    <Stack data-testid="uniswap-curve-comparison">
      <TabsSwitcher
        variant="contained"
        value="compare"
        options={[{ value: 'compare', label: t`What changes when you migrate` }]}
      />
      <Stack sx={{ padding: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill }}>
        <EvmDataTable category="detail" table={table} />
      </Stack>
    </Stack>
  )
}
