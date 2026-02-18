import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Tooltip as TooltipComponent } from '@ui-kit/shared/ui/Tooltip'
import { mapBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, type SxProps } from '@ui-kit/utils'

const { IconSize, Spacing } = SizesAndSpaces

const ColorStates = {
  info: {
    bg: (t: Theme) => t.design.Layer.Feedback.Info,
    fg: (t: Theme) => t.design.Layer[1].Outline,
  },
  orange: {
    bg: (t: Theme) => t.design.Color.Tertiary[400],
    fg: (t: Theme) => t.design.Layer[1].Outline,
  },
  red: {
    bg: (t: Theme) => t.design.Layer.Feedback.Error,
    fg: (t: Theme) => t.design.Text.TextColors.FilledFeedback.Alert.Primary,
  },
}

export type ColorState = keyof typeof ColorStates

export const UserPositionIndicator = ({
  colorState = 'info',
  Tooltip,
  sx,
}: {
  colorState?: ColorState
  Tooltip: React.ComponentType<Omit<React.ComponentProps<typeof TooltipComponent>, 'title'>>
  sx?: SxProps
}) => (
  /**
   * Frustratingly, there's a known issue with MUI where tooltips don't render when
   * this component only exports a Box and is wrapped with a Tooltip by the parent.
   *
   * It's also not straightforward to make the Tooltip optional via `WithWrapper`
   * due to complex type inference issues that arise.
   */
  <Tooltip>
    <Box
      sx={applySxProps(
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: ColorStates[colorState].bg,
          marginInlineStart: mapBreakpoints(Spacing.md, (v) => `-${v}`), // negative padding to offset the padding of the cell
          marginInlineEnd: Spacing.sm,
        },
        sx,
      )}
    >
      <LlamaIcon sx={{ color: ColorStates[colorState].fg, width: IconSize.md, height: IconSize.md }} />
    </Box>
  </Tooltip>
)
