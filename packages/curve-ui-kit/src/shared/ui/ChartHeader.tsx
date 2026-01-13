import { MouseEvent } from 'react'
import { Icon } from 'ui/src/Icon'
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
  isChartExpanded: boolean
  toggleChartExpanded: () => void
  chartOptions: ChartOption<T>[]
  // set timeOptions to show select dropdown
  timeOptions?: TimeOption[]
  activeChartOption: T
  setActiveChartOption: (value: T) => void
  activeTimeOption?: TimeOption
  setActiveTimeOption?: (newTimeOption: TimeOption) => void
  /* 
  hideExpandChart is used to hide the expand chart button when the
  chart is already taking up the full width of the viewport
  */
  hideExpandChart?: boolean
}

export const ChartHeader = <T extends string>({
  isChartExpanded,
  toggleChartExpanded,
  chartOptions,
  timeOptions,
  activeChartOption,
  setActiveChartOption,
  activeTimeOption,
  setActiveTimeOption,
  hideExpandChart = false,
}: ChartHeaderProps<T>) => {
  const handleChartOption = (_: MouseEvent<HTMLElement>, key: T) => {
    // ensure that one option is always selected by checking null
    if (key !== null) setActiveChartOption(key)
  }
  const handleTimeOption = (event: SelectChangeEvent<TimeOption>) => {
    if (event.target.value !== null && setActiveTimeOption) setActiveTimeOption(event.target.value as TimeOption)
  }
  /*
  The small breakpoint is used for placing Title and ToggleButtonGroup in a column 
  and separate the expand Chart button to the right
  */
  const smallBreakPoint = '35.9375rem' // 575px
  const foundChartOption = chartOptions.find((option) => option.key === activeChartOption)

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
      <Typography variant="headingXsBold" color="textSecondary">
        {foundChartOption?.activeTitle ?? '?'}
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
            <ToggleButton value={option.key} key={option.key} size="small">
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
