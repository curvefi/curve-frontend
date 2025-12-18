import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import ChartHeader, { ChartOption } from '../ChartHeader'

type ChartKey = 'savingsRate' | 'distributions'

const defaultChartOptions: ChartOption<ChartKey>[] = [
  { key: 'savingsRate', label: 'Savings Rate', activeTitle: 'Historical Rate' },
  { key: 'distributions', label: 'Distributions', activeTitle: 'Historical Distributions' },
]

const timeOptions: TimeOption[] = ['1M', '6M', '1Y']

type WrapperProps = {
  chartOptionVariant: 'select' | 'buttons-group'
  showTimeOption?: boolean
  showExpandChart?: boolean
  customButton?: React.ReactNode
  initialExpanded?: boolean
}

const ChartHeaderWrapper = ({
  chartOptionVariant,
  showTimeOption = false,
  showExpandChart = true,
  customButton,
  initialExpanded = false,
}: WrapperProps) => {
  const [activeChart, setActiveChart] = useState<ChartKey>('savingsRate')
  const [activeTime, setActiveTime] = useState<TimeOption>('1M')
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, maxWidth: 600 }}>
      <ChartHeader
        chartOptionVariant={chartOptionVariant}
        chartOptions={{
          options: defaultChartOptions,
          activeOption: activeChart,
          setActiveOption: setActiveChart,
        }}
        timeOption={
          showTimeOption
            ? {
                options: timeOptions,
                activeOption: activeTime,
                setActiveOption: setActiveTime,
              }
            : undefined
        }
        expandChart={
          showExpandChart
            ? {
                isExpanded,
                toggleChartExpanded: () => setIsExpanded(!isExpanded),
              }
            : undefined
        }
        customButton={customButton}
      />
    </Box>
  )
}

const meta: Meta<typeof ChartHeader<ChartKey>> = {
  title: 'UI Kit/Widgets/ChartHeader',
  component: ChartHeader,
  argTypes: {
    chartOptionVariant: {
      control: 'select',
      options: ['select', 'buttons-group'],
      description: 'Display chart options as a dropdown select or toggle button group',
    },
    chartOptions: {
      control: { disable: true },
      description: 'Object containing options array, activeOption, and setActiveOption callback',
    },
    timeOption: {
      control: { disable: true },
      description: 'Optional object containing time period options, activeOption, and setActiveOption callback',
    },
    expandChart: {
      control: { disable: true },
      description: 'Optional object containing isExpanded state and toggleChartExpanded callback',
    },
    customButton: {
      control: { disable: true },
      description: 'Optional custom button ReactNode to render in the header',
    },
  },
}

type Story = StoryObj<typeof ChartHeader<ChartKey>>

export const ButtonsGroup: Story = {
  render: () => <ChartHeaderWrapper chartOptionVariant="buttons-group" />,
  parameters: {
    docs: {
      description: {
        component:
          'A header component for charts that provides toggle buttons or a select dropdown for switching between different chart views, an optional time period selector, and an expand/collapse button.',
        story: 'Chart header with toggle button group for chart options',
      },
    },
  },
}

export const SelectVariant: Story = {
  render: () => <ChartHeaderWrapper chartOptionVariant="select" />,
  parameters: {
    docs: {
      description: {
        story: 'Chart header with dropdown select for chart options',
      },
    },
  },
}

export const WithTimeOption: Story = {
  render: () => <ChartHeaderWrapper chartOptionVariant="buttons-group" showTimeOption />,
  parameters: {
    docs: {
      description: {
        story: 'Chart header with time period dropdown selector',
      },
    },
  },
}

export const Expanded: Story = {
  render: () => <ChartHeaderWrapper chartOptionVariant="buttons-group" initialExpanded />,
  parameters: {
    docs: {
      description: {
        story: 'Chart header showing the minimize icon when chart is expanded',
      },
    },
  },
}

export const WithoutExpandButton: Story = {
  render: () => <ChartHeaderWrapper chartOptionVariant="buttons-group" showExpandChart={false} />,
  parameters: {
    docs: {
      description: {
        story: 'Chart header without the expand/collapse button',
      },
    },
  },
}

export const WithCustomButton: Story = {
  render: () => (
    <ChartHeaderWrapper
      chartOptionVariant="buttons-group"
      customButton={
        <Button variant="outlined" size="small">
          Export
        </Button>
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Chart header with a custom button element',
      },
    },
  },
}

export const FullFeatured: Story = {
  render: () => (
    <ChartHeaderWrapper
      chartOptionVariant="buttons-group"
      showTimeOption
      customButton={
        <Button variant="outlined" size="small">
          Export
        </Button>
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Chart header with all features: toggle buttons, time selector, custom button, and expand button',
      },
    },
  },
}

export const NarrowContainer: Story = {
  render: () => {
    const [activeChart, setActiveChart] = useState<ChartKey>('savingsRate')
    const [activeTime, setActiveTime] = useState<TimeOption>('1M')
    const [isExpanded, setIsExpanded] = useState(false)

    return (
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, maxWidth: 400 }}>
        <ChartHeader
          chartOptionVariant="buttons-group"
          chartOptions={{
            options: defaultChartOptions,
            activeOption: activeChart,
            setActiveOption: setActiveChart,
          }}
          timeOption={{
            options: timeOptions,
            activeOption: activeTime,
            setActiveOption: setActiveTime,
          }}
          expandChart={{
            isExpanded,
            toggleChartExpanded: () => setIsExpanded(!isExpanded),
          }}
        />
      </Box>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart header in a narrow container showing responsive column layout',
      },
    },
  },
}

export default meta
