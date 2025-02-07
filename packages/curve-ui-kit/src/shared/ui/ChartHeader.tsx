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
  /* 
  hideExpandChart is used to hide the expand chart button when the
  chart is already taking up the full width of the viewport
  */
  hideExpandChart?: boolean
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
  hideExpandChart = false,
}: ChartHeaderProps) => {
  const handleChartOption = (event: React.MouseEvent<HTMLElement>, newChartOption: ChartOption) => {
    // ensure that one option is always selected by checking null
    if (newChartOption !== null) setActiveChartOption(newChartOption)
  }
  const handleTimeOption = (event: SelectChangeEvent<TimeOption>) => {
    if (event.target.value !== null) setActiveTimeOption(event.target.value as TimeOption)
  }
  /*
  The small breakpoint is used for placing Title and ToggleButtonGroup in a column 
  and separate the expand Chart button to the right
  */
  const smallBreakPoint = '35.9375rem' // 575px

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        padding: Spacing.md,
        rowGap: Spacing.md,
        columnGap: Spacing.sm,
        [`@media (max-width: ${smallBreakPoint})`]: { flexDirection: 'column', alignItems: 'flex-start' },
      }}
    >
      <Typography variant="headingXsBold" color="textSecondary">
        {activeChartOption.activeTitle}
      </Typography>
      <Stack
        direction="row"
        sx={{
          [`@media (max-width: ${smallBreakPoint})`]: { width: '100%' },
        }}
      >
        <ToggleButtonGroup
          exclusive
          value={activeChartOption}
          onChange={handleChartOption}
          sx={{ [`@media (max-width: ${smallBreakPoint})`]: { width: '100%', display: 'flex', flexGrow: 1 } }}
        >
          {chartOptions.map((option) => (
            <ToggleButton value={option} key={option.label} size="small">
              {option.label}
            </ToggleButton>
          ))}
          {!hideExpandChart && (
            <IconButton
              size="small"
              onClick={toggleChartExpanded}
              sx={{ [`@media (max-width: ${smallBreakPoint})`]: { marginLeft: 'auto' } }}
            >
              <Icon name={isChartExpanded ? 'Minimize' : 'Maximize'} size={20} />
            </IconButton>
          )}
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
    </Stack>
  )
}

export default ChartHeader
