import type { MouseEvent } from 'react'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { notFalsy } from '@primitives/objects.utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { TableFilterItem } from './TableFilterItem'

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
  testIdSuffix?: string
}

export const TableFilterButtonGroup = <T extends string>({
  title,
  value,
  onChange,
  ariaLabel,
  options,
  testIdSuffix,
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
            data-testid={notFalsy<string>('table-filter-btn', testIdSuffix, optionValue).join('-')}
          >
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </TableFilterItem>
  )
}
