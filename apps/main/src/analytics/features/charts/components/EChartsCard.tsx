import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts-for-react/lib/types'
import type { ReactNode } from 'react'
import { DialogFullscreen } from '@/analytics/features/charts/components/DialogFullscreen'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const MIN_HEIGHT = 300 // (default) min height of charts when not in fullscreen

type ChartCardProps = {
  /** Card title */
  title: ReactNode
  /** Card actions */
  action?: ReactNode
  /** Whether the chart is currently loading or not */
  loading: boolean
  /** EChart options */
  option: EChartsOption
  /** Whether the card should be shown as a fullscreen modal or */
  fullscreen?: boolean
  /** When the fullscreen modal is being closed */
  onCloseFullscreen?: () => void
  /** Content for below the chart, like an optional legend for example */
  children?: ReactNode
}

/** General purpose card for ECharts graphs with optional support of fullscreen mode */
export const EChartsCard = ({
  title,
  action,
  loading,
  option,
  fullscreen = false,
  onCloseFullscreen,
  children,
}: ChartCardProps) => (
  <WithWrapper shouldWrap={fullscreen} Wrapper={DialogFullscreen} onClose={() => onCloseFullscreen?.()}>
    {/** A lot of flex and height code is to make sure the chart expands correctly in fullscreen mode */}
    <Card component={Stack} height="100%">
      <CardHeader
        {...(!fullscreen && { size: 'small' })}
        title={title}
        action={
          <Stack direction="row" gap={Spacing.xs}>
            {action}
          </Stack>
        }
      />

      <CardContent component={Stack} gap={Spacing.md} flexGrow={1} {...(!fullscreen && { size: 'small' })}>
        <Box position="relative" {...(fullscreen && { flexGrow: 1 })}>
          {loading && <CircularProgress sx={{ position: 'absolute', inset: 0, margin: 'auto', zIndex: 2 }} />}
          <ReactECharts
            notMerge
            option={option}
            style={{
              height: '100%',
              ...(!fullscreen && { minHeight: MIN_HEIGHT }),
              ...(loading && { opacity: 0.5 }),
            }}
          />
        </Box>

        {children}
      </CardContent>
    </Card>
  </WithWrapper>
)
