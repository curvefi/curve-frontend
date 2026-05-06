import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CHART_REFERENCE_LINE_WIDTH, type ChartLineDashPattern } from '@ui-kit/shared/ui/Chart/chart.utils'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { Transition, Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const TransitionFunction = `${Transition} ${Duration.Delay}ms`
const LEGEND_BOX_SIZE = 12

export const LegendLine = ({
  color,
  dash,
  opacity = 1,
}: {
  color: string
  dash?: ChartLineDashPattern
  opacity?: number
}) => (
  <svg width="20" height="2" style={{ opacity, transition: `opacity ${TransitionFunction}` }}>
    <line x1="0" y1="1" x2="20" y2="1" stroke={color} strokeWidth={2} strokeDasharray={dash?.join(' ')} />
  </svg>
)

export const LegendBox = ({
  outline,
  fill,
  opacity = 1,
  shape = 'box',
  outlineWidth = shape === 'corners' ? CHART_REFERENCE_LINE_WIDTH : 1,
}: {
  outline: string
  fill: string
  opacity?: number
  outlineWidth?: number
  shape?: 'box' | 'corners'
}) =>
  shape === 'corners' ? (
    <svg
      width={LEGEND_BOX_SIZE}
      height={LEGEND_BOX_SIZE}
      viewBox={`0 0 ${LEGEND_BOX_SIZE} ${LEGEND_BOX_SIZE}`}
      style={{ opacity, overflow: 'visible', transition: `opacity ${TransitionFunction}` }}
    >
      <path
        d="M0 4 V0 H4 M8 0 H12 V4 M12 8 V12 H8 M4 12 H0 V8"
        stroke={outline}
        strokeWidth={outlineWidth}
        fill="none"
      />
    </svg>
  ) : (
    <svg
      width={LEGEND_BOX_SIZE}
      height={LEGEND_BOX_SIZE}
      style={{ opacity, transition: `opacity ${TransitionFunction}` }}
    >
      <rect
        x="0"
        y="0"
        width={LEGEND_BOX_SIZE}
        height={LEGEND_BOX_SIZE}
        stroke={outline}
        strokeWidth={outlineWidth}
        fill={fill}
      />
    </svg>
  )

export type LegendItem = {
  label: string
  line?: {
    lineStroke: string
    dash?: ChartLineDashPattern
  }
  box?: {
    outlineStroke?: string
    fill: string
    outlineWidth?: number
    shape?: 'box' | 'corners'
  }
  toggled?: boolean
  onToggle?: (label: string) => void
}

export const LegendSet = ({ label, line, box, toggled = true, onToggle }: LegendItem) => (
  <WithWrapper shouldWrap={onToggle} Wrapper={ButtonBase} onClick={() => onToggle?.(label)}>
    <Stack direction="row" spacing={Spacing.xs} alignItems="center">
      {line && <LegendLine color={line.lineStroke} dash={line.dash} opacity={toggled ? 1 : 0.7} />}
      {box && (
        <LegendBox
          outline={box.outlineStroke ?? 'none'}
          fill={box.fill}
          opacity={toggled ? 1 : 0.7}
          outlineWidth={box.outlineWidth}
          shape={box.shape}
        />
      )}
      <Typography
        variant="bodySRegular"
        sx={theme => ({
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
