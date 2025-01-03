import Stack from '@mui/material/Stack'
import React from 'react'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/**
 * Displays warnings for a pool, such as deprecated pools or pools with collateral corrosion.
 * Note: for now, this component is an empty placeholder to keep the design correct, it does not display any warnings.
 */
export const PoolWarnings = () => <Stack direction="row" gap={Spacing.sm} sx={{ height: 20 }}></Stack>
