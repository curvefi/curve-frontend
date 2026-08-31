import { t } from '@evm-ui/lib/i18n'
import { TableFilterButtonGroup } from '@evm-ui/shared/ui/DataTable/TableFilterButtonGroup'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import type { ProposalStatusFilter } from '../columns'
import { PROPOSAL_FILTERS } from '../constants'

const { Spacing } = SizesAndSpaces

export const ProposalsFilters = ({
  setStatus,
  status,
}: {
  setStatus: (value: ProposalStatusFilter) => void
  status: ProposalStatusFilter
}) => (
  <Stack spacing={Spacing.sm} sx={{ padding: Spacing.sm }}>
    <TableFilterButtonGroup
      title={t`Status`}
      value={status}
      onChange={(_, value) => value && setStatus(value)}
      ariaLabel={t`Filter proposals by status`}
      options={PROPOSAL_FILTERS.map(({ key, label }) => ({ label, value: key }))}
      testIdSuffix="proposals-status"
    />
  </Stack>
)
