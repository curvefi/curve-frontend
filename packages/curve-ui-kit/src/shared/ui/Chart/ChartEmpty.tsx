import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize, MaxWidth } = SizesAndSpaces

type ChartEmptyProps = {
  height: number
  title?: ReactNode
  message?: ReactNode
}

export const ChartEmpty = ({ height, title, message = t`No chart data found` }: ChartEmptyProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: height,
    }}
  >
    <Stack flexDirection="column" alignItems="center" gap={Spacing.md} padding={Spacing.md}>
      <LlamaIcon sx={{ width: IconSize.xxl, height: IconSize.xxl }} />
      <Stack alignItems="center">
        {title && (
          <Typography variant="headingXsBold" sx={{ maxWidth: MaxWidth.emptyStateCard, textAlign: 'center' }}>
            {title}
          </Typography>
        )}
        <Typography
          variant="bodySRegular"
          sx={{
            maxWidth: MaxWidth.emptyStateCard,
            textAlign: 'center',
            color: t => t.design.Text.TextColors.Secondary,
          }}
        >
          {message}
        </Typography>
      </Stack>
    </Stack>
  </Box>
)
