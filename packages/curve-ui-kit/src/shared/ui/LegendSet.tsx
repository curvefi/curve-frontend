import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const LegendLine = ({ color, dash }: { color: string; dash?: string }) => (
  <svg width="20" height="2">
    <line x1="0" y1="1" x2="20" y2="1" stroke={color} strokeWidth={2} strokeDasharray={dash} />
  </svg>
)

export const LegendBox = ({ outline, fill }: { outline: string; fill: string }) => (
  <svg width="12" height="12">
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

export const LegendSet = ({ label, line, box, toggled = true, onToggle }: LegendItem) => {
  const opacity = toggled ? 1 : 0.35

  return (
    <WithWrapper shouldWrap={onToggle} Wrapper={ButtonBase} onClick={() => onToggle?.(label)}>
      <Stack
        direction="row"
        spacing={Spacing.xs}
        alignItems="center"
        sx={{
          opacity,
          transition: `opacity ${TransitionFunction}`,
        }}
      >
        {line && <LegendLine color={line.lineStroke} dash={line.dash} />}
        {box && <LegendBox outline={box.outlineStroke ?? 'none'} fill={box.fill} />}
        <Typography variant="bodySRegular">{label}</Typography>
      </Stack>
    </WithWrapper>
  )
}
