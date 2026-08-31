import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import type { RewardsApy } from '@/dex/types/main.types'
import { t } from '@evm-ui/lib/i18n'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { Sortable } from '@evm-ui/shared/ui/DataTable/Sortable'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { HeaderContext } from '@tanstack/react-table'
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
