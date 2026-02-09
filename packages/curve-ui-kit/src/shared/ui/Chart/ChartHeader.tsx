import { MouseEvent } from 'react'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { Icon } from '@ui/Icon'
import { t } from '@ui-kit/lib/i18n'
import { ArrowsHorizontalIcon } from '@ui-kit/shared/icons/ArrowsHorizontalIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, type SxProps } from '@ui-kit/utils/mui'

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
    activeSelection: TChartKey | undefined
    /** optional: not all charts have multiple options */
    setActiveSelection?: (value: TChartKey) => void
  }
  timeOption?: {
    options: readonly TTimeOption[]
    activeOption: TTimeOption
    setActiveOption: (newTimeOption: TTimeOption) => void
  }
  expandChart?: {
    isExpanded: boolean
    toggleChartExpanded: () => void
  }
  chartOptionVariant: 'select' | 'buttons-group'
  flipChart?: () => void
  customButton?: React.ReactNode
  /** When true, displays "Loading" in the chart selection area and disables interaction */
  isLoading?: boolean
  sx?: SxProps
}

export const ChartHeader = <TChartKey extends string, TTimeOption extends string = string>({
  expandChart,
  chartSelections,
  timeOption,
  chartOptionVariant,
  flipChart,
  customButton,
  isLoading = false,
  sx,
}: ChartHeaderProps<TChartKey, TTimeOption>) => {
  const handleChartOptionToggle = (_: MouseEvent<HTMLElement>, key: TChartKey) => {
    // ensure that one option is always selected by checking null
    if (key != null && chartSelections.setActiveSelection) chartSelections.setActiveSelection(key)
  }
  const handleChartOptionSelect = (event: SelectChangeEvent<TChartKey>) => {
    if (event.target.value != null && chartSelections.setActiveSelection)
      chartSelections.setActiveSelection(event.target.value as TChartKey)
  }
  const handleTimeOption = (event: SelectChangeEvent<TTimeOption>) => {
    if (event.target.value != null && timeOption) timeOption.setActiveOption(event.target.value as TTimeOption)
  }
  const foundChartOption = chartSelections.selections.find(
    (selection) => selection.key === chartSelections.activeSelection,
  )
  const hasSingleOption = chartSelections.selections.length === 1

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      sx={applySxProps({ rowGap: Spacing.md, columnGap: Spacing.sm }, sx)}
    >
      {/* Show the active selection title or Select dropdown menu based on the chartOptionVariant */}
      {chartOptionVariant === 'buttons-group' || hasSingleOption ? (
        <Typography variant="bodySBold">{isLoading ? t`Loading` : (foundChartOption?.activeTitle ?? '?')}</Typography>
      ) : isLoading ? (
        <Select value="loading" size="small" sx={{ alignSelf: 'center' }} disabled>
          <MenuItem value="loading">
            <Typography variant="bodySBold">{t`Loading`}</Typography>
          </MenuItem>
        </Select>
      ) : (
        <Stack direction="row" alignItems="center" gap={Spacing.sm}>
          <Select
            value={chartSelections.activeSelection ?? ''}
            onChange={handleChartOptionSelect}
            size="small"
            sx={{ alignSelf: 'center' }}
            MenuProps={{
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
              transformOrigin: { vertical: 'top', horizontal: 'left' },
            }}
          >
            {chartSelections.selections.map((selection) => (
              <MenuItem value={selection.key} key={selection.key}>
                <Typography variant="bodySBold">{selection.activeTitle}</Typography>
              </MenuItem>
            ))}
          </Select>
          {flipChart && (
            <IconButton color="ghost" size="extraSmall" onClick={flipChart}>
              <ArrowsHorizontalIcon />
            </IconButton>
          )}
        </Stack>
      )}
      <Stack direction="row" alignItems="center">
        <ToggleButtonGroup exclusive value={chartSelections.activeSelection} onChange={handleChartOptionToggle}>
          {chartOptionVariant === 'buttons-group' &&
            !hasSingleOption &&
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
              disabled={isLoading}
              MenuProps={{
                anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
                transformOrigin: { vertical: 'top', horizontal: 'right' },
              }}
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
            <IconButton size="small" onClick={expandChart.toggleChartExpanded}>
              <Icon name={expandChart?.isExpanded ? 'Minimize' : 'Maximize'} size={20} />
            </IconButton>
          )}
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  )
}
