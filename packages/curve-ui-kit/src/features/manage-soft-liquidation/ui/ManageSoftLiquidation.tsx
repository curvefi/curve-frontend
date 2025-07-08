import { useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ActionInfos, type Props as ActionInfosProps } from './ActionInfos'
import { ClosePosition, type Props as ClosePositionProps } from './tabs/ClosePosition'
import { ImproveHealth, type Props as ImproveHealthProps } from './tabs/ImproveHealth'

const { Spacing, MaxWidth, MinWidth } = SizesAndSpaces

const TABS_MAIN = [{ value: 'manage', label: t`Manage soft-liquidation`, href: '' }] as const

const TABS_SUB = [
  { value: 'improve-health', label: t`Improve health`, href: '' },
  { value: 'close-position', label: t`Close position`, href: '' },
] as const
type SubTab = (typeof TABS_SUB)[number]['value']

export type Props = {
  actionInfos: ActionInfosProps
  improveHealth: ImproveHealthProps
  closePosition: ClosePositionProps
}

export const ManageSoftLiquidation = ({ actionInfos, improveHealth, closePosition }: Props) => {
  const [subTab, setSubTab] = useState<SubTab>(TABS_SUB[0].value)

  return (
    <Stack sx={{ gap: Spacing.sm }}>
      <Stack>
        <TabsSwitcher variant="contained" size="medium" value="manage" options={TABS_MAIN} />
        <Box
          sx={{
            backgroundColor: t => t.design.Layer[1].Fill,
            maxWidth: MaxWidth.actionCard,
            minWidth: MinWidth.actionCard,
          }}
        >
          <TabsSwitcher
            variant="underlined"
            size="small"
            value={subTab}
            options={TABS_SUB}
            onChange={setSubTab}
            sx={{ '& .MuiTab-root': { flexGrow: 1 } }}
          />

          {subTab === 'improve-health' && <ImproveHealth {...improveHealth} />}
          {subTab === 'close-position' && <ClosePosition {...closePosition} />}
        </Box>
      </Stack>

      <ActionInfos {...actionInfos} />
    </Stack>
  )
}
