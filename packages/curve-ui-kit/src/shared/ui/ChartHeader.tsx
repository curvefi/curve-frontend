import { MouseEvent } from 'react'
import Icon from 'ui/src/Icon'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export type ChartOption<T = string> = {
  activeTitle: string
  label: string
  key: T
}

type ChartHeaderProps<T = string> = {
  chartOptions: {
    options: ChartOption<T>[]
    activeOption: T
    setActiveOption: (value: T) => void
  }
  timeOption?: {
    options: TimeOption[]
    activeOption: TimeOption
    setActiveOption: (newTimeOption: TimeOption) => void
  }
  expandChart?: {
    isExpanded: boolean
    toggleChartExpanded: () => void
  }
  chartOptionVariant: 'select' | 'buttons-group'
  customButton?: React.ReactNode
}

const ChartHeader = <T extends string>({
  expandChart,
  chartOptions,
  timeOption,
  chartOptionVariant,
  customButton,
}: ChartHeaderProps<T>) => {
  const handleChartOptionToggle = (_: MouseEvent<HTMLElement>, key: T) => {
    // ensure that one option is always selected by checking null
    if (key !== null) chartOptions.setActiveOption(key)
  }
  const handleChartOptionSelect = (event: SelectChangeEvent<T>) => {
    if (event.target.value !== null) chartOptions.setActiveOption(event.target.value as T)
  }
  const handleTimeOption = (event: SelectChangeEvent<TimeOption>) => {
    if (event.target.value !== null && timeOption) timeOption.setActiveOption(event.target.value as TimeOption)
  }
  /*
  The small breakpoint is used for placing Title and ToggleButtonGroup in a column 
  and separate the expand Chart button to the right
  */
  const smallBreakPoint = '35.9375rem' // 575px
  const foundChartOption = chartOptions.options.find((option) => option.key === chartOptions.activeOption)

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        padding: Spacing.md,
        rowGap: Spacing.md,
        columnGap: Spacing.sm,
        [`@media (max-width: ${smallBreakPoint})`]: {
          flexDirection: 'column',
          alignItems: 'flex-start',
          rowGap: Spacing.lg,
        },
      }}
    >
      {chartOptionVariant === 'buttons-group' ? (
        <Typography variant="headingXsBold" color="textSecondary">
          {foundChartOption?.activeTitle ?? '?'}
        </Typography>
      ) : (
        <Select
          value={chartOptions.activeOption}
          onChange={handleChartOptionSelect}
          size="small"
          sx={{ alignSelf: 'center' }}
        >
          {chartOptions.options.map((option) => (
            <MenuItem value={option.key} key={option.key}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      )}
      <Stack
        direction="row"
        sx={{
          [`@media (max-width: ${smallBreakPoint})`]: { width: '100%' },
        }}
      >
        <ToggleButtonGroup
          exclusive
          value={chartOptions.activeOption}
          onChange={handleChartOptionToggle}
          sx={{ [`@media (max-width: ${smallBreakPoint})`]: { width: '100%', display: 'flex', flexGrow: 1 } }}
        >
          {chartOptionVariant === 'buttons-group' &&
            chartOptions.options.map((option) => (
              <ToggleButton value={option.key} key={option.key} size="small">
                {option.label}
              </ToggleButton>
            ))}
          {timeOption && (
            <Select
              value={timeOption.activeOption}
              onChange={handleTimeOption}
              size="small"
              sx={{ width: '100px', textTransform: 'uppercase', alignSelf: 'center' }}
            >
              {timeOption.options.map((option) => (
                <MenuItem value={option} key={option} sx={{ textTransform: 'uppercase' }}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          )}
          {customButton}
          {expandChart && (
            <IconButton
              size="small"
              onClick={expandChart.toggleChartExpanded}
              sx={{ [`@media (max-width: ${smallBreakPoint})`]: { marginLeft: 'auto' } }}
            >
              <Icon name={expandChart?.isExpanded ? 'Minimize' : 'Maximize'} size={20} />
            </IconButton>
          )}
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  )
}

export default ChartHeader
