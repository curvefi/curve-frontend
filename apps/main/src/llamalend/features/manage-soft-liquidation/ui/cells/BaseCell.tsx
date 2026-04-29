import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const BaseCell = ({ children }: { children: ReactNode }) => <Stack paddingBlock={Spacing.md}>{children}</Stack>
