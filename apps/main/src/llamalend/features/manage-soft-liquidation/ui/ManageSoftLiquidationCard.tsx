import { useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ActionInfos, type Props as ActionInfosProps } from './ActionInfos'
import { ClosePosition, type Props as ClosePositionProps } from './tabs/ClosePosition'
import { ImproveHealth, type Props as ImproveHealthProps } from './tabs/ImproveHealth'

const { Spacing } = SizesAndSpaces

const tabs: TabOption<'manage'>[] = [{ value: 'manage', label: t`Manage soft-liquidation` }]

type SubTab = 'improve-health' | 'close-position'
const subTabs: TabOption<SubTab>[] = [
  { value: 'improve-health', label: t`Improve health` },
  { value: 'close-position', label: t`Close position` },
]

export type Props = {
  actionInfos: ActionInfosProps
  improveHealth: ImproveHealthProps
  closePosition: ClosePositionProps
}

export const ManageSoftLiquidationCard = ({ actionInfos, improveHealth, closePosition }: Props) => {
  const [subTab, setSubTab] = useState<SubTab>(subTabs[0].value)

  return (
    <Stack
      sx={{
        gap: Spacing.sm,
        marginInline: { mobile: 'auto', desktop: 0 },
      }}
    >
      <Stack>
        <TabsSwitcher variant="contained" value="manage" options={tabs} fullWidth />
        <Box sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
          <TabsSwitcher variant="underlined" value={subTab} options={subTabs} onChange={setSubTab} fullWidth />
          {subTab === 'improve-health' && <ImproveHealth {...improveHealth} />}
          {subTab === 'close-position' && <ClosePosition {...closePosition} />}
        </Box>
      </Stack>

      <ActionInfos {...actionInfos} />
    </Stack>
  )
}
