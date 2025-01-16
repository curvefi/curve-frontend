import { useState } from 'react'
import { Stack, ToggleButtonGroup } from '@mui/material'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import IconButton from '@mui/material/IconButton'
import Icon from 'ui/src/Icon'

const { Spacing } = SizesAndSpaces

export type ChartOption = {
  label: string
  activeTitle: string
}

type TimeOption = {
  label: '1d' | '7d' | '30d'
}

type ChartHeaderProps = {
  chartOptions: ChartOption[]
  timeOptions?: TimeOption[]
}

const ChartHeader = ({ chartOptions, timeOptions }: ChartHeaderProps) => {
  const [activeChartOption, setActiveChartOption] = useState(chartOptions[0])

  const handleChartOption = (event: React.MouseEvent<HTMLElement>, newChartOption: ChartOption) => {
    // ensure that one option is always selected by checking null
    if (newChartOption !== null) setActiveChartOption(newChartOption)
  }

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ padding: Spacing.md }}>
      <Typography variant="headingXsBold" color="textSecondary">
        {activeChartOption.activeTitle}
      </Typography>
      <ToggleButtonGroup exclusive value={activeChartOption} onChange={handleChartOption}>
        {chartOptions.map((option) => (
          <ToggleButton value={option} key={option.label} size="small">
            {option.label}
          </ToggleButton>
        ))}
        <IconButton size="small">
          <Icon name="Maximize" size={20} />
        </IconButton>
      </ToggleButtonGroup>
    </Stack>
  )
}

export default ChartHeader
