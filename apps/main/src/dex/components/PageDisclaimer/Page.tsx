'use client'
import type { NextPage } from 'next'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'

const { Spacing } = SizesAndSpaces

const Page = () => (
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
