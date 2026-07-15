import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import type { RewardsApy } from '@/dex/types/main.types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { type HeaderContext } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { Sortable } from '@ui-kit/shared/ui/DataTable/Sortable'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LegacyPoolColumnId } from '../columns'
import type { LegacyPoolListItem } from '../legacy-pools.types'

const { Spacing } = SizesAndSpaces

export const LegacyRewardsOtherHeader = ({ table }: HeaderContext<LegacyPoolListItem, RewardsApy | undefined>) => (
  <Stack>
    <Box>{t`Rewards tAPR`}</Box>
    <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'end' }}>
      {useNetworkFromUrl()?.isCrvRewardsEnabled && (
        <>
          <Sortable column={table.getColumn(LegacyPoolColumnId.RewardsCrv)} size="large">{`CRV`}</Sortable>
          <Box component="span">{'+'}</Box>
        </>
      )}
      <Sortable column={table.getColumn(LegacyPoolColumnId.RewardsIncentives)} size="large">{`Incentives`}</Sortable>
    </Stack>
  </Stack>
)
