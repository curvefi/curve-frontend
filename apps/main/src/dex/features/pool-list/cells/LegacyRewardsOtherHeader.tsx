import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import type { RewardsApy } from '@/dex/types/main.types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { HeaderContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { Sortable } from '@ui/features/tables/Sortable'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { LegacyPoolColumnId } from '../columns'
import type { LegacyPoolRow } from '../types'

const { Spacing } = SizesAndSpaces

export const LegacyRewardsOtherHeader = ({
  table,
}: HeaderContext<CurveTableFeatures, LegacyPoolRow, RewardsApy | undefined>) => (
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
