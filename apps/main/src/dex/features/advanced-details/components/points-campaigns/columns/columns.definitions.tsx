import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { TokenInfo, type TokenInfoProps } from '@ui-kit/shared/ui/TokenInfo'
import { PointsCampaignsColumnId } from './columns.enum'

export type PointsCampaignsRow = TableItem & {
  source: TokenInfoProps
  multiplier: string
  campaignUrl: string
}

const columnHelper = createColumnHelper<PointsCampaignsRow>()

const headers = {
  [PointsCampaignsColumnId.Source]: t`Source`,
  [PointsCampaignsColumnId.Multiplier]: t`Multiplier`,
  [PointsCampaignsColumnId.CampaignUrl]: t`Details`,
} as const

export const POINTS_CAMPAIGNS_COLUMNS = [
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
            // Avoid need of useIsMobile hook
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
]
