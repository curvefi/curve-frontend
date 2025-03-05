import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { AdvancedMode } from './advanced-mode/AdvancedMode'
import { ThemeSelector } from './theme-selector/ThemeSelector'
import { HideSmallPoolsSetting } from './hide-small-pools/HideSmallPoolsSetting'

const { Spacing } = SizesAndSpaces

export const Settings = () => (
  <Stack gap={Spacing.md}>
    <ThemeSelector />
    <AdvancedMode />
    <HideSmallPoolsSetting />
  </Stack>
)
