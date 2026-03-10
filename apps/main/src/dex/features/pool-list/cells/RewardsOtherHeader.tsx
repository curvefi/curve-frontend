import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import type { RewardsApy } from '@/dex/types/main.types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { type HeaderContext } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { Sortable } from '@ui-kit/shared/ui/DataTable/Sortable'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolColumnId } from '../columns'
import type { PoolListItem } from '../types'

const { Spacing } = SizesAndSpaces

export const RewardsOtherHeader = ({ table }: HeaderContext<PoolListItem, RewardsApy | undefined>) => (
  <Stack>
    <Box>{t`Rewards tAPR`}</Box>
    <Stack direction="row" gap={Spacing.xs} alignItems="end">
      {useNetworkFromUrl()?.isCrvRewardsEnabled && (
        <>
          <Sortable column={table.getColumn(PoolColumnId.RewardsCrv)}>{`CRV`}</Sortable>
          <Box component="span">{'+'}</Box>
        </>
      )}
      <Sortable column={table.getColumn(PoolColumnId.RewardsIncentives)}>{`Incentives`}</Sortable>
    </Stack>
  </Stack>
)
