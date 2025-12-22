import { MouseEvent } from 'react'
import Icon from 'ui/src/Icon'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { SxProps } from '@ui-kit/utils/mui'

const { Spacing } = SizesAndSpaces

export type ChartSelections<TChartKey = string> = {
  /** Display title of the active selection (in the button-group variant it's on the left) */
  activeTitle: string
  /** Select dropdown menu item label or button-group button label */
  label: string
  key: TChartKey
}

type ChartHeaderProps<TChartKey extends string = string, TTimeOption extends string = string> = {
  chartSelections: {
    selections: ChartSelections<TChartKey>[]
    activeSelection: TChartKey
    setActiveSelection: (value: TChartKey) => void
  }
  timeOption?: {
    options: TTimeOption[]
    activeOption: TTimeOption
    setActiveOption: (newTimeOption: TTimeOption) => void
  }
  expandChart?: {
    isExpanded: boolean
    toggleChartExpanded: () => void
  }
  chartOptionVariant: 'select' | 'buttons-group'
  customButton?: React.ReactNode
  sx?: SxProps[]
}

const ChartHeader = <TChartKey extends string, TTimeOption extends string = string>({
  expandChart,
  chartSelections,
  timeOption,
  chartOptionVariant,
  customButton,
  sx = [],
}: ChartHeaderProps<TChartKey, TTimeOption>) => {
  const handleChartOptionToggle = (_: MouseEvent<HTMLElement>, key: TChartKey) => {
    // ensure that one option is always selected by checking null
    if (key !== null) chartSelections.setActiveSelection(key)
  }
  const handleChartOptionSelect = (event: SelectChangeEvent<TChartKey>) => {
    if (event.target.value !== null) chartSelections.setActiveSelection(event.target.value as TChartKey)
  }
  const handleTimeOption = (event: SelectChangeEvent<TTimeOption>) => {
    if (event.target.value !== null && timeOption) timeOption.setActiveOption(event.target.value as TTimeOption)
  }
  /*
  The small breakpoint is used for placing Title and ToggleButtonGroup in a column 
  and separate the expand Chart button to the right
  */
  const smallBreakPoint = '35.9375rem' // 575px
  const foundChartOption = chartSelections.selections.find(
    (selection) => selection.key === chartSelections.activeSelection,
  )

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={[
        {
          rowGap: Spacing.md,
          columnGap: Spacing.sm,
          [`@media (max-width: ${smallBreakPoint})`]: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            rowGap: Spacing.lg,
          },
        },
        ...sx,
      ]}
    >
      {/* Show the active selection title or Select dropdown menu based on the chartOptionVariant */}
      {chartOptionVariant === 'buttons-group' ? (
        <Typography variant="headingXsBold" color="textSecondary">
          {foundChartOption?.activeTitle ?? '?'}
        </Typography>
      ) : (
        <Select
          value={chartSelections.activeSelection}
          onChange={handleChartOptionSelect}
          size="small"
          sx={{ alignSelf: 'center' }}
        >
          {chartSelections.selections.map((selection) => (
            <MenuItem value={selection.key} key={selection.key}>
              <Typography variant="bodySBold">{selection.activeTitle}</Typography>
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
          value={chartSelections.activeSelection}
          onChange={handleChartOptionToggle}
          sx={{ [`@media (max-width: ${smallBreakPoint})`]: { width: '100%', display: 'flex', flexGrow: 1 } }}
        >
          {chartOptionVariant === 'buttons-group' &&
            chartSelections.selections.map((selection) => (
              <ToggleButton value={selection.key} key={selection.key} size="small">
                {selection.label}
              </ToggleButton>
            ))}
          {timeOption && (
            <Select
              value={timeOption.activeOption}
              onChange={handleTimeOption}
              size="small"
              sx={{ alignSelf: 'center' }}
            >
              {timeOption.options.map((timeOption) => (
                <MenuItem value={timeOption} key={timeOption}>
                  <Typography variant="bodySBold" sx={{ textTransform: 'uppercase' }}>
                    {timeOption}
                  </Typography>
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
