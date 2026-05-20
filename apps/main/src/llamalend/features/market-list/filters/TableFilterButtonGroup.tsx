import type { MouseEvent } from 'react'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { TableFilterItem } from '@ui-kit/shared/ui/DataTable/TableFilterItem'

export type TableFilterButtonOption<T extends string> = {
  value: T
  label: string
}

type TableFilterButtonGroupProps<T extends string> = {
  title: string
  value: T
  onChange: (_: MouseEvent<HTMLElement>, value: T | null) => void
  ariaLabel: string
  options: readonly TableFilterButtonOption<T>[]
}

export const TableFilterButtonGroup = <T extends string>({
  title,
  value,
  onChange,
  ariaLabel,
  options,
}: TableFilterButtonGroupProps<T>) => {
  const isMobile = useIsMobile()
  return (
    <TableFilterItem title={title}>
      <ToggleButtonGroup exclusive compact value={value} onChange={onChange} aria-label={ariaLabel}>
        {options.map(({ value: optionValue, label }) => (
          <ToggleButton
            key={optionValue}
            value={optionValue}
            size={isMobile ? 'small' : 'extraSmall'}
            sx={{ flex: 1, whiteSpace: 'nowrap' }}
          >
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </TableFilterItem>
  )
}
