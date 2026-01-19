import type { MouseEvent } from 'react'
import { useState } from 'react'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { t } from '@ui-kit/lib/i18n'
import { ChartFooter } from '@ui-kit/shared/ui/Chart/ChartFooter'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'

type TimeRange = '1D' | '1W' | '1M'
const timeRanges: TimeRange[] = ['1D', '1W', '1M']

const meta: Meta<typeof ChartFooter> = {
  title: 'UI Kit/Widgets/ChartFooter',
  component: ChartFooter,
  argTypes: {
    legendSets: {
      control: { disable: true },
      description: 'Array of legend items to display. Each can have a line, box, or both.',
    },
    description: {
      control: 'boolean',
      description: 'Whether to show the soft liquidation warning text below the legends',
    },
    toggleOptions: {
      control: { disable: true },
      description: 'Optional array of toggle button options (e.g., time ranges)',
    },
    activeToggleOption: {
      control: { disable: true },
      description: 'Currently selected toggle option',
    },
    onToggleChange: {
      control: { disable: true },
      description: 'Callback when toggle option changes',
    },
  },
}

type Story = StoryObj<typeof ChartFooter<TimeRange>>

/** Basic legend sets matching the lend app OHLC chart */
const BasicLegendsWrapper = () => {
  const theme = useTheme()

  const legendSets: LegendItem[] = [
    {
      label: t`Oracle Price`,
      line: { lineStroke: theme.palette.primary.main, dash: 'none' },
    },
    {
      label: t`Conversion zone`,
      box: { fill: theme.design.Chart.LiquidationZone.Current },
    },
  ]

  return (
    <Box sx={{ maxWidth: 600 }}>
      <ChartFooter legendSets={legendSets} />
    </Box>
  )
}

export const Basic: Story = {
  render: () => <BasicLegendsWrapper />,
  parameters: {
    docs: {
      description: {
        component:
          'A footer component for charts that displays legend items and optional toggle buttons. Used below OHLC charts in the lend and loan apps.',
        story: 'Basic chart footer with oracle price and conversion zone legends from the lend app',
      },
    },
  },
}

/** Interactive legends with new conversion zone (when adjusting loan parameters) */
const InteractiveLegendsWrapper = () => {
  const theme = useTheme()

  const [visibility, setVisibility] = useState({
    oraclePrice: true,
    conversionZone: true,
    newConversionZone: true,
  })

  const toggleVisibility = (label: string) => {
    if (label === t`Oracle Price`) {
      setVisibility((prev) => ({ ...prev, oraclePrice: !prev.oraclePrice }))
    } else if (label === t`Conversion zone`) {
      setVisibility((prev) => ({ ...prev, conversionZone: !prev.conversionZone }))
    } else if (label === t`New conversion zone`) {
      setVisibility((prev) => ({ ...prev, newConversionZone: !prev.newConversionZone }))
    }
  }

  const legendSets: LegendItem[] = [
    {
      label: t`Oracle Price`,
      line: { lineStroke: theme.palette.primary.main, dash: 'none' },
      toggled: visibility.oraclePrice,
      onToggle: toggleVisibility,
    },
    {
      label: t`Conversion zone`,
      box: { fill: theme.design.Chart.LiquidationZone.Current },
      toggled: visibility.conversionZone,
      onToggle: toggleVisibility,
    },
    {
      label: t`New conversion zone`,
      box: { fill: theme.design.Chart.LiquidationZone.Future },
      toggled: visibility.newConversionZone,
      onToggle: toggleVisibility,
    },
  ]

  return (
    <Box sx={{ maxWidth: 600 }}>
      <ChartFooter legendSets={legendSets} />
    </Box>
  )
}

export const WithInteractiveLegends: Story = {
  render: () => <InteractiveLegendsWrapper />,
  parameters: {
    docs: {
      description: {
        story:
          'Chart footer showing interactive legends that can be toggled to show/hide oracle price line and liquidation range overlays on OHLC charts in the lend and loan apps. When toggled off the legend is set to opacity 0.35.',
      },
    },
  },
}

/** With soft liquidation warning text */
const WithSoftLiquidationWrapper = () => {
  const theme = useTheme()

  const legendSets: LegendItem[] = [
    {
      label: t`Oracle Price`,
      line: { lineStroke: theme.palette.primary.main, dash: 'none' },
    },
    {
      label: t`Conversion zone`,
      box: { fill: theme.design.Chart.LiquidationZone.Current },
    },
  ]

  return (
    <Box sx={{ maxWidth: 600 }}>
      <ChartFooter
        legendSets={legendSets}
        description={t`When the price enters the liquidation zone, health will start decreasing putting your position at risk. Repay debt to improve health or close your position to avoid liquidation.`}
      />
    </Box>
  )
}

export const WithSoftLiquidationText: Story = {
  render: () => <WithSoftLiquidationWrapper />,
  parameters: {
    docs: {
      description: {
        story: 'Chart footer with soft liquidation warning text displayed below the legends',
      },
    },
  },
}

/** With toggle buttons for time range selection */
const WithToggleButtonsWrapper = () => {
  const theme = useTheme()
  const [activeTime, setActiveTime] = useState<TimeRange>('1W')

  const handleToggleChange = (_: MouseEvent<HTMLElement>, newValue: TimeRange) => {
    if (newValue) {
      setActiveTime(newValue)
    }
  }

  const legendSets: LegendItem[] = [
    {
      label: t`Oracle Price`,
      line: { lineStroke: theme.palette.primary.main, dash: 'none' },
    },
    {
      label: t`Conversion zone`,
      box: { fill: theme.design.Chart.LiquidationZone.Current },
    },
  ]

  return (
    <Box sx={{ maxWidth: 600 }}>
      <ChartFooter
        legendSets={legendSets}
        toggleOptions={timeRanges}
        activeToggleOption={activeTime}
        onToggleChange={handleToggleChange}
      />
    </Box>
  )
}

export const WithToggleButtons: Story = {
  render: () => <WithToggleButtonsWrapper />,
  parameters: {
    docs: {
      description: {
        story: 'Chart footer with time range toggle buttons',
      },
    },
  },
}

/** Full featured example with all options */
const FullFeaturedWrapper = () => {
  const theme = useTheme()
  const [activeTime, setActiveTime] = useState<TimeRange>('1M')
  const [visibility, setVisibility] = useState({
    oraclePrice: true,
    conversionZone: true,
    newConversionZone: true,
  })

  const handleToggleChange = (_: MouseEvent<HTMLElement>, newValue: TimeRange) => {
    if (newValue) {
      setActiveTime(newValue)
    }
  }

  const toggleVisibility = (label: string) => {
    if (label === t`Oracle Price`) {
      setVisibility((prev) => ({ ...prev, oraclePrice: !prev.oraclePrice }))
    } else if (label === t`Conversion zone`) {
      setVisibility((prev) => ({ ...prev, conversionZone: !prev.conversionZone }))
    } else if (label === t`New conversion zone`) {
      setVisibility((prev) => ({ ...prev, newConversionZone: !prev.newConversionZone }))
    }
  }

  const legendSets: LegendItem[] = [
    {
      label: t`Oracle Price`,
      line: { lineStroke: theme.palette.primary.main, dash: 'none' },
      toggled: visibility.oraclePrice,
      onToggle: toggleVisibility,
    },
    {
      label: t`Conversion zone`,
      box: { fill: theme.design.Chart.LiquidationZone.Current },
      toggled: visibility.conversionZone,
      onToggle: toggleVisibility,
    },
    {
      label: t`New conversion zone`,
      box: { fill: theme.design.Chart.LiquidationZone.Future },
      toggled: visibility.newConversionZone,
      onToggle: toggleVisibility,
    },
  ]

  return (
    <Box sx={{ maxWidth: 600 }}>
      <ChartFooter
        legendSets={legendSets}
        toggleOptions={timeRanges}
        activeToggleOption={activeTime}
        onToggleChange={handleToggleChange}
        description={t`When the price enters the liquidation zone, health will start decreasing putting your position at risk. Repay debt to improve health or close your position to avoid liquidation.`}
      />
    </Box>
  )
}

export const FullFeatured: Story = {
  render: () => <FullFeaturedWrapper />,
  parameters: {
    docs: {
      description: {
        story: 'Chart footer with all features: interactive legends, toggle buttons, and soft liquidation text',
      },
    },
  },
}

/** Line legends using chart line colors from theme */
const LineLegendsWrapper = () => {
  const theme = useTheme()

  const legendSets: LegendItem[] = [
    { label: 'Line 1', line: { lineStroke: theme.design.Chart.Lines.Line1, dash: 'none' } },
    { label: 'Line 2', line: { lineStroke: theme.design.Chart.Lines.Line2, dash: '4 2' } },
    { label: 'Line 3', line: { lineStroke: theme.design.Chart.Lines.Line3, dash: '2 2' } },
  ]

  return (
    <Box sx={{ maxWidth: 600 }}>
      <ChartFooter legendSets={legendSets} />
    </Box>
  )
}

export const LineLegendsOnly: Story = {
  render: () => <LineLegendsWrapper />,
  parameters: {
    docs: {
      description: {
        story: 'Chart footer showing line-style legends using theme chart line colors',
      },
    },
  },
}

/** Box legends using candle colors from theme */
const BoxLegendsWrapper = () => {
  const theme = useTheme()

  const legendSets: LegendItem[] = [
    {
      label: 'Positive (Candle)',
      box: { outlineStroke: theme.design.Chart.Candles.Positive, fill: `${theme.design.Chart.Candles.Positive}33` },
    },
    {
      label: 'Negative (Candle)',
      box: { outlineStroke: theme.design.Chart.Candles.Negative, fill: `${theme.design.Chart.Candles.Negative}33` },
    },
    {
      label: 'Current Liq Zone',
      box: { fill: theme.design.Chart.LiquidationZone.Current },
    },
    {
      label: 'Future Liq Zone',
      box: { fill: theme.design.Chart.LiquidationZone.Future },
    },
  ]

  return (
    <Box sx={{ maxWidth: 600 }}>
      <ChartFooter legendSets={legendSets} />
    </Box>
  )
}

export const BoxLegendsOnly: Story = {
  render: () => <BoxLegendsWrapper />,
  parameters: {
    docs: {
      description: {
        story: 'Chart footer showing box-style legends using theme chart colors for candles and liquidation zones',
      },
    },
  },
}

/** Narrow container showing responsive wrapping */
const NarrowContainerWrapper = () => {
  const theme = useTheme()
  const [activeTime, setActiveTime] = useState<TimeRange>('1W')

  const handleToggleChange = (_: MouseEvent<HTMLElement>, newValue: TimeRange) => {
    if (newValue) {
      setActiveTime(newValue)
    }
  }

  const legendSets: LegendItem[] = [
    {
      label: t`Oracle Price`,
      line: { lineStroke: theme.palette.primary.main, dash: 'none' },
    },
    {
      label: t`Conversion zone`,
      box: { fill: theme.design.Chart.LiquidationZone.Current },
    },
    {
      label: t`New conversion zone`,
      box: { fill: theme.design.Chart.LiquidationZone.Future },
    },
  ]

  return (
    <Box sx={{ maxWidth: 350 }}>
      <ChartFooter
        legendSets={legendSets}
        toggleOptions={timeRanges}
        activeToggleOption={activeTime}
        onToggleChange={handleToggleChange}
        description={t`When the price enters the liquidation zone, health will start decreasing putting your position at risk. Repay debt to improve health or close your position to avoid liquidation.`}
      />
    </Box>
  )
}

export const NarrowContainer: Story = {
  render: () => <NarrowContainerWrapper />,
  parameters: {
    docs: {
      description: {
        story: 'Chart footer in a narrow container showing responsive wrapping behavior',
      },
    },
  },
}

export default meta
