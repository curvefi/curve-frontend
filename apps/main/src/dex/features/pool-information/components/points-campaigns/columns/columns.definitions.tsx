import { t } from '@evm-ui/lib/i18n'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { ExternalLink } from '@evm-ui/shared/ui/ExternalLink'
import { TokenInfo, type TokenInfoProps } from '@evm-ui/shared/ui/TokenInfo'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { PointsCampaignsColumnId } from './columns.enum'

export type PointsCampaignsRow = {
  source: TokenInfoProps
  multiplier: string
  campaignUrl: string
}

const columnHelper = createAppColumnHelper<PointsCampaignsRow>()

const headers = {
  [PointsCampaignsColumnId.Source]: t`Source`,
  [PointsCampaignsColumnId.Multiplier]: t`Multiplier`,
  [PointsCampaignsColumnId.CampaignUrl]: t`Details`,
} as const

export const POINTS_CAMPAIGNS_COLUMNS = columnHelper.columns([
  columnHelper.accessor('source', {
    id: PointsCampaignsColumnId.Source,
    header: headers[PointsCampaignsColumnId.Source],
    cell: ({ getValue }) => (
      <InlineTableCell>
        <TokenInfo {...getValue()} boldPrimary />
      </InlineTableCell>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('multiplier', {
    id: PointsCampaignsColumnId.Multiplier,
    header: headers[PointsCampaignsColumnId.Multiplier],
    cell: ({ getValue }) => (
      <InlineTableCell>
        <Typography>{getValue()}</Typography>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('campaignUrl', {
    id: PointsCampaignsColumnId.CampaignUrl,
    header: headers[PointsCampaignsColumnId.CampaignUrl],
    cell: ({ getValue }) => (
      <InlineTableCell>
        <ExternalLink
          href={getValue()}
          label={
            <Box component="span" sx={{ display: { mobile: 'none', tablet: 'inline' } }}>
              {t`To campaign`}
            </Box>
          }
          sx={{ justifyContent: 'end' }}
        />
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
])
