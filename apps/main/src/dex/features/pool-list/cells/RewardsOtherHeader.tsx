import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import type { RewardsApy } from '@/dex/types/main.types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { type HeaderContext } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { Sortable } from '@ui-kit/shared/ui/DataTable/Sortable'
import { PoolColumnId } from '../columns'
import type { PoolListItem } from '../types'

export const RewardsOtherHeader = ({ table }: HeaderContext<PoolListItem, RewardsApy | undefined>) => (
  <Stack>
    <Box>{t`Rewards tAPR`}</Box>
    <Stack direction="row" alignItems="end">
      {useNetworkFromUrl()?.isCrvRewardsEnabled && (
        <>
          <Sortable column={table.getColumn(PoolColumnId.RewardsCrv)}>{`CRV`}</Sortable>
          <Box component="span">{' + '}</Box>
        </>
      )}
      <Sortable column={table.getColumn(PoolColumnId.RewardsIncentives)}>{`Incentives`}</Sortable>
    </Stack>
  </Stack>
)
