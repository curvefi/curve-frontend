'use client'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import type { NetworkUrlParams } from '@/lend/types/lend.types'

const { Spacing } = SizesAndSpaces

const Page = ({}: NetworkUrlParams) => (
  <Stack
    alignItems="center"
    gap={Spacing.xl}
    sx={{
      marginInline: 'auto',
      marginBlockStart: Spacing.xl,
      marginBlockEnd: Spacing.xxl,
    }}
  >
    <Disclaimer />
  </Stack>
)

export default Page
