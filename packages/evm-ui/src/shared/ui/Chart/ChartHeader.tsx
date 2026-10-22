import { type MouseEvent, type ReactNode } from 'react'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ArrowsHorizontalIcon } from '@ui/icons/ArrowsHorizontalIcon'
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
   * Card title height, smaller title inset and primary title text; the parent provides the surface.
   */
  nested?: boolean
  flipChart?: () => void
  customButton?: ReactNode
  /** When true, shows a skeleton in the chart selection area and disables interaction */
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
          ...(nested && { minHeight: Sizing.lg }),
        },
        sx,
      )}
    >
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        {title && (
          <Typography
            variant="headingXsBold"
            color={nested ? 'textPrimary' : 'textSecondary'}
            sx={{ paddingInline: nested ? Spacing.sm : Padding.Card.sm }}
          >
            {title}
          </Typography>
        )}
        {/* Show the active selection title or Select dropdown menu based on the chartOptionVariant */}
        {chartOptionVariant === 'buttons-group' || hasSingleOption || isLoading ? (
          <WithSkeleton loading={isLoading}>
            <Typography variant="bodySBold">{foundChartOption?.activeTitle ?? '?'}</Typography>
          </WithSkeleton>
        ) : (
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
            <ChartSelect
              options={chartSelections.selections.map(({ key, activeTitle }) => ({ value: key, label: activeTitle }))}
              activeOption={chartSelections.activeSelection}
              setActiveOption={key => chartSelections.setActiveSelection?.(key)}
            />
            {flipChart && (
              <IconButton color="ghost" size="extraSmall" onClick={flipChart}>
                <ArrowsHorizontalIcon />
              </IconButton>
            )}
          </Stack>
        )}
      </Stack>
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
