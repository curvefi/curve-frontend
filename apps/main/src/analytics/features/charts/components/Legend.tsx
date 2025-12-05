import Box from '@mui/material/Box'
import type { LegendItem } from '../hooks/useLegend'

type LegendProps<T extends string> = {
  items: LegendItem<T>[]
  disabled?: T[]
  onToggle?: (item: T) => void
}

/**
 * Legend component for chart series
 *
 * Displays colored markers with labels for each series in the chart.
 * Supports toggling series visibility when items are marked as togglable.
 *
 * @example
 * <Legend
 *   items={[
 *     { id: 'supply', label: 'Supply', color: '#2081F0' },
 *     { id: 'debt', label: 'Debt', color: '#FFD700', togglable: true }
 *   ]}
 *   disabled={['debt']}
 *   onToggle={(id) => console.log('Toggled:', id)}
 * />
 */
export function Legend<T extends string>({ items, disabled = [], onToggle }: LegendProps<T>) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: '1.5rem',
      }}
    >
      {items.map((item) => {
        const isDisabled = disabled.includes(item.id)
        const isTogglable = item.togglable ?? false

        return (
          <Box
            key={item.id}
            onClick={isTogglable ? () => onToggle?.(item.id) : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: isTogglable ? 'pointer' : 'default',
              userSelect: 'none',
              '&:hover .legend-label': isTogglable
                ? {
                    color: 'var(--c-lvl0)',
                    backgroundColor: 'var(--c-lvl6)',
                  }
                : {},
            }}
          >
            <Box
              sx={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: 'var(--border-radius)',
                backgroundColor: item.color,
                opacity: isDisabled ? 0.25 : 1,
                transition: 'opacity 125ms ease-out',
              }}
            />
            <Box
              className="legend-label"
              sx={{
                fontSize: '0.875rem',
                color: 'var(--c-lvl5)',
              }}
            >
              {item.label}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
