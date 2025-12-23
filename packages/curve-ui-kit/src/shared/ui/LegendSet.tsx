import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

/**
 * Legend line component to be used together with Charts
 */
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

export type LegendSetType = {
  label: string
  line?: {
    lineStroke: string
    dash: string
  }
  box?: {
    outlineStroke?: string
    fill: string
  }
}

export const LegendSet = ({ label, line, box }: LegendSetType) => (
  <Stack direction="row" spacing={2} alignItems="center">
    {line && <LegendLine color={line.lineStroke} dash={line.dash} />}
    {box && <LegendBox outline={box.outlineStroke ?? 'none'} fill={box.fill} />}
    <Typography variant="bodySRegular">{label}</Typography>
  </Stack>
)
