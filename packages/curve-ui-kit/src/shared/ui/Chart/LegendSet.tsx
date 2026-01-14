import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { Transition, Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const TransitionFunction = `${Transition} ${Duration.Delay}ms`

export const LegendLine = ({ color, dash, opacity = 1 }: { color: string; dash?: string; opacity?: number }) => (
  <svg width="20" height="2" style={{ opacity, transition: `opacity ${TransitionFunction}` }}>
    <line x1="0" y1="1" x2="20" y2="1" stroke={color} strokeWidth={2} strokeDasharray={dash} />
  </svg>
)

export const LegendBox = ({ outline, fill, opacity = 1 }: { outline: string; fill: string; opacity?: number }) => (
  <svg width="12" height="12" style={{ opacity, transition: `opacity ${TransitionFunction}` }}>
    <rect x="0" y="0" width="12" height="12" stroke={outline} fill={fill} />
  </svg>
)

export type LegendItem = {
  label: string
  line?: {
    lineStroke: string
    dash: string
  }
  box?: {
    outlineStroke?: string
    fill: string
  }
  toggled?: boolean
  onToggle?: (label: string) => void
}

export const LegendSet = ({ label, line, box, toggled = true, onToggle }: LegendItem) => (
  <WithWrapper shouldWrap={onToggle} Wrapper={ButtonBase} onClick={() => onToggle?.(label)}>
    <Stack direction="row" spacing={Spacing.xs} alignItems="center">
      {line && <LegendLine color={line.lineStroke} dash={line.dash} opacity={toggled ? 1 : 0.7} />}
      {box && <LegendBox outline={box.outlineStroke ?? 'none'} fill={box.fill} opacity={toggled ? 1 : 0.7} />}
      <Typography
        variant="bodySRegular"
        sx={(theme) => ({
          color: toggled ? undefined : theme.palette.text.disabled,
          transition: `color ${TransitionFunction}`,
          'button:hover &': { color: theme.palette.text.highlight },
        })}
      >
        {label}
      </Typography>
    </Stack>
  </WithWrapper>
)
