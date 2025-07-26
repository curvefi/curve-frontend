'use client'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Footer } from './components/Footer'
import { PegKeeper } from './components/PegKeeper'
import { Statistics } from './components/Statistics'
import { PEG_KEEPERS } from './constants'

const {
  Spacing,
  Grid: { Column_Spacing, Row_Spacing },
} = SizesAndSpaces

type Props = NetworkUrlParams // Even though we use it, NextJS will complain without the real page.tsx

export const Page = ({}: Props) => (
  <Stack
    sx={{
      paddingBlock: Spacing.xl,
      paddingInline: Spacing.md,
      gap: Spacing.xxl,
    }}
    data-testid="pegkeepers"
  >
    <Statistics />

    <Box
      display="grid"
      columnGap={Column_Spacing}
      rowGap={Row_Spacing}
      gridTemplateColumns="repeat(auto-fit, minmax(20rem, 1fr))"
    >
      {PEG_KEEPERS.map((pegkeeper) => (
        <PegKeeper
          key={pegkeeper.address}
          {...pegkeeper}
          sx={{ maxWidth: '30rem' }}
          testId={`pegkeeper-${pegkeeper.address}`}
        />
      ))}
    </Box>

    <Footer />
  </Stack>
)
