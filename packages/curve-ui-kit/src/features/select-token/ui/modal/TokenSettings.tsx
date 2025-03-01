import { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const { Spacing } = SizesAndSpaces

const SettingLabel = ({ children }: { children?: ReactNode }) => (
  <Typography variant="headingXsBold" display="inline-block" sx={{ marginLeft: 4, marginRight: 2 }}>
    {children}
  </Typography>
)

const Setting = ({ children }: { children?: ReactNode }) => (
  <Stack direction="row" gap={Spacing.sm} justifyContent="space-between" alignItems="center">
    {children}
  </Stack>
)

const LABEL_HIDE_SMALL_POOLS = 'Hide tokens with very small pools'

export const TokenSettings = () => {
  const hideSmallPools = useUserProfileStore((state) => state.hideSmallPools)
  const setHideSmallPools = useUserProfileStore((state) => state.setHideSmallPools)

  return (
    <Stack gap={Spacing.md}>
      <Setting>
        <SettingLabel>{t`${LABEL_HIDE_SMALL_POOLS}`}</SettingLabel>

        <Switch
          checked={hideSmallPools}
          onChange={() => setHideSmallPools(!hideSmallPools)}
          color="primary"
          inputProps={{ 'aria-label': t`${LABEL_HIDE_SMALL_POOLS}` }}
          size="small"
        />
      </Setting>
    </Stack>
  )
}
