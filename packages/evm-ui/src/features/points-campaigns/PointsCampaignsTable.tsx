import { t } from '@evm-ui/lib/i18n'
import { createAppColumnHelper, useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { ExternalLink } from '@evm-ui/shared/ui/ExternalLink'
import { TokenInfo } from '@evm-ui/shared/ui/TokenInfo'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { constQ } from '@ui/features/queries/util'
import type { PointsCampaignRow } from './points-campaigns.utils'

enum PointsCampaignColumnId {
  Source = 'source',
  Multiplier = 'multiplier',
  CampaignUrl = 'campaignUrl',
}

const columnHelper = createAppColumnHelper<PointsCampaignRow>()
const COLUMNS = columnHelper.columns([
  columnHelper.accessor('source', {
    id: PointsCampaignColumnId.Source,
    header: t`Source`,
    cell: ({ getValue }) => (
      <InlineTableCell>
        <TokenInfo {...getValue()} boldPrimary />
      </InlineTableCell>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('multiplier', {
    id: PointsCampaignColumnId.Multiplier,
    header: t`Multiplier`,
    cell: ({ getValue }) => (
      <InlineTableCell>
        <Typography>{getValue()}</Typography>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('campaignUrl', {
    id: PointsCampaignColumnId.CampaignUrl,
    header: t`Details`,
    cell: ({ getValue }) => (
      <InlineTableCell>
        <ExternalLink
          href={getValue()}
          label={<Box component="span" sx={{ display: { mobile: 'none', tablet: 'inline' } }}>{t`To campaign`}</Box>}
          sx={{ justifyContent: 'end' }}
        />
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
])

/** Renders the shared points-campaign columns without imposing a product-specific card or header. */
export const PointsCampaignsTable = ({ rows }: { rows: PointsCampaignRow[] }) => {
  const table = useCurveTable({ query: constQ(rows), columns: COLUMNS })

  return <DataTable category="detail" table={table} emptyState={{ title: t`No points campaigns found` }} />
}
