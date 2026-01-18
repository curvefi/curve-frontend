import { MouseEvent } from 'react'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

export type ActivitySelection<TKey extends string = string> = {
  key: TKey
  label: string
}

type ActivityTableHeaderProps<TKey extends string> = {
  selections: ActivitySelection<TKey>[]
  activeSelection: TKey
  onSelectionChange: (key: TKey) => void
}

export const ActivityTableHeader = <TKey extends string>({
  selections,
  activeSelection,
  onSelectionChange,
}: ActivityTableHeaderProps<TKey>) => {
  const handleToggle = (_: MouseEvent<HTMLElement>, key: TKey | null) => {
    // Ensure that one option is always selected by checking null
    if (key != null) onSelectionChange(key)
  }

  return (
    <Stack direction="row" alignItems="center">
      <ToggleButtonGroup exclusive value={activeSelection} onChange={handleToggle}>
        {selections.map((selection) => (
          <ToggleButton value={selection.key} key={selection.key} size="small">
            {selection.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  )
}
