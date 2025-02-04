import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import Stack from '@mui/material/Stack'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
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

type ChartHeaderProps = {
  isChartExpanded: boolean
  toggleChartExpanded: () => void
  chartOptions: ChartOption[]
  // set timeOptions to show select dropdown
  timeOptions?: TimeOption[]
  activeChartOption: ChartOption
  setActiveChartOption: (newChartOption: ChartOption) => void
  activeTimeOption: TimeOption
  setActiveTimeOption: (newTimeOption: TimeOption) => void
}

const ChartHeader = ({
  isChartExpanded,
  toggleChartExpanded,
  chartOptions,
  timeOptions,
  activeChartOption,
  setActiveChartOption,
  activeTimeOption,
  setActiveTimeOption,
}: ChartHeaderProps) => {
  const handleChartOption = (event: React.MouseEvent<HTMLElement>, newChartOption: ChartOption) => {
    // ensure that one option is always selected by checking null
    if (newChartOption !== null) setActiveChartOption(newChartOption)
  }

  const handleTimeOption = (event: SelectChangeEvent<TimeOption>) => {
    if (event.target.value !== null) setActiveTimeOption(event.target.value as TimeOption)
  }

  return (
    <Stack direction="row" alignItems="center" gap={Spacing.sm} sx={{ padding: Spacing.md }}>
      <Typography variant="headingXsBold" color="textSecondary">
        {activeChartOption.activeTitle}
      </Typography>
      <ToggleButtonGroup sx={{ marginLeft: 'auto' }} exclusive value={activeChartOption} onChange={handleChartOption}>
        {chartOptions.map((option) => (
          <ToggleButton value={option} key={option.label} size="small">
            {option.label}
          </ToggleButton>
        ))}
        <IconButton size="small" onClick={toggleChartExpanded}>
          <Icon name={isChartExpanded ? 'Minimize' : 'Maximize'} size={20} />
        </IconButton>
      </ToggleButtonGroup>
      {timeOptions && (
        <Select
          value={activeTimeOption}
          onChange={handleTimeOption}
          size="small"
          sx={{ width: '100px', textTransform: 'uppercase' }}
        >
          {timeOptions.map((option) => (
            <MenuItem value={option} key={option} sx={{ textTransform: 'uppercase' }}>
              {option}
            </MenuItem>
          ))}
        </Select>
      )}
    </Stack>
  )
}

export default ChartHeader
