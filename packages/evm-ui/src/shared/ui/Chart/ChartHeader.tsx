import { type MouseEvent, type ReactNode } from 'react'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { Select } from '@ui/components/Select'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ArrowsHorizontalIcon } from '@ui/icons/ArrowsHorizontalIcon'
import { t } from '@ui/lib/i18n'
import { applySxProps, type SxProps } from '@ui/lib/mui'
import { ChartSelect, type ChartSelectOptions } from './ChartSelect'

const { Spacing, Padding, Sizing } = SizesAndSpaces

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
  timeOption?: ChartSelectOptions<TTimeOption>
  chartOptionVariant: 'select' | 'buttons-group'
  /** Rendered before the chart selection */
  title?: ReactNode
  /**
   * Use when the header sits inside a card's content; mirrors the Figma "Nested" property.
   * Fills the row with Layer 1 at card title height, with a smaller title inset and primary title text.
   */
  nested?: boolean
  flipChart?: () => void
  customButton?: ReactNode
  /** When true, displays "Loading" in the chart selection area and disables interaction */
  isLoading?: boolean
  sx?: SxProps
}

export const ChartHeader = <TChartKey extends string, TTimeOption extends string = string>({
  chartSelections,
  timeOption,
  chartOptionVariant,
  title,
  nested = false,
  flipChart,
  customButton,
  isLoading = false,
  sx,
}: ChartHeaderProps<TChartKey, TTimeOption>) => {
  const handleChartOptionToggle = (_: MouseEvent<HTMLElement>, key: TChartKey) => {
    // ensure that one option is always selected by checking null
    if (key != null && chartSelections.setActiveSelection) chartSelections.setActiveSelection(key)
  }
  const foundChartOption = chartSelections.selections.find(
    selection => selection.key === chartSelections.activeSelection,
  )
  const hasSingleOption = chartSelections.selections.length === 1

  // Active selection title or Select dropdown menu based on the chartOptionVariant
  const chartSelection =
    chartOptionVariant === 'buttons-group' || hasSingleOption ? (
      <Typography variant="bodySBold">{isLoading ? t`Loading` : (foundChartOption?.activeTitle ?? '?')}</Typography>
    ) : isLoading ? (
      <Select variant="ghost" value="loading" size="tiny" sx={{ alignSelf: 'center' }} disabled>
        <MenuItem value="loading">
          <Typography variant="bodySBold">{t`Loading`}</Typography>
        </MenuItem>
      </Select>
    ) : (
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <Select
          variant="ghost"
          value={chartSelections.activeSelection ?? ''}
          onChange={event => {
            if (event.target.value != null && chartSelections.setActiveSelection)
              chartSelections.setActiveSelection(event.target.value as TChartKey)
          }}
          size="tiny"
          sx={{ alignSelf: 'center' }}
          MenuProps={{
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformOrigin: { vertical: 'top', horizontal: 'left' },
          }}
        >
          {chartSelections.selections.map(selection => (
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
    )

  return (
    <Stack
      direction="row"
      sx={applySxProps(
        {
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: Spacing.md,
          columnGap: Spacing.sm,
          // matches the small CardHeader height so the row lines up with sibling card titles
          ...(nested && { backgroundColor: theme => theme.design.Layer[1].Fill, minHeight: Sizing.lg }),
        },
        sx,
      )}
    >
      {title ? (
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <Typography
            component="h3"
            variant="headingXsBold"
            color={nested ? 'textPrimary' : 'textSecondary'}
            sx={{ paddingInline: nested ? Spacing.sm : Padding.Card.sm }}
          >
            {title}
          </Typography>
          {chartSelection}
        </Stack>
      ) : (
        chartSelection
      )}
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <ToggleButtonGroup exclusive value={chartSelections.activeSelection} onChange={handleChartOptionToggle}>
          {chartOptionVariant === 'buttons-group' &&
            !hasSingleOption &&
            chartSelections.selections.map(selection => (
              <ToggleButton value={selection.key} key={selection.key} size="small">
                {selection.label}
              </ToggleButton>
            ))}
          {timeOption && (
            <ChartSelect
              options={timeOption.options}
              activeOption={timeOption.activeOption}
              setActiveOption={timeOption.setActiveOption}
              isLoading={isLoading}
            />
          )}
          {customButton}
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  )
}
