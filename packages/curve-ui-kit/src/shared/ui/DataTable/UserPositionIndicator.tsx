import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { mapBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

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

export type UserPositionIndicatorProps = {
  colorState?: ColorState
} & {
  tooltipTitle: TooltipProps['title']
  tooltipBody?: TooltipProps['body']
}

export const UserPositionIndicator = ({
  colorState = 'info',
  tooltipTitle,
  tooltipBody,
}: UserPositionIndicatorProps) => (
  /**
   * Frustratingly, there's a known issue with MUI where tooltips don't render when
   * this component only exports a Box and is wrapped with a Tooltip by the parent.
   *
   * At first I tried to add `Tooltip: typeof MuiTooltip` as a prop and wrap the Box with it,
   * but that causes a lot of typing issues with how a `title` prop is required. Believe me,
   * I've tried, but simply passing two separate props for `title` and `body` is much easier
   * to type and use.
   *
   * It's also not straightforward to make the Tooltip optional via `WithWrapper`, due to
   * additional complex type inference issues that arise.
   */
  <Tooltip title={tooltipTitle} body={tooltipBody}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorStates[colorState].bg,
        marginInlineStart: mapBreakpoints(Spacing.md, (v) => `-${v}`), // negative padding to offset the padding of the cell
        marginInlineEnd: Spacing.sm,
      }}
    >
      <LlamaIcon sx={{ color: ColorStates[colorState].fg, width: IconSize.md, height: IconSize.md }} />
    </Box>
  </Tooltip>
)
