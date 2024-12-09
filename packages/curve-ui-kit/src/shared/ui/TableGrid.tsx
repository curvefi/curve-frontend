import { FunctionComponent, ReactNode, useRef } from 'react'
import { Grid2, Grid2Props } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'
import { useIntersectionObserver } from 'ui'

type TableGridColumn<T> = {
  component: FunctionComponent<{ data: T }>
  size: Grid2Props['size']
  title: ReactNode
  key: string
}
type TableGridProps<T> = { data: T[]; columns: TableGridColumn<T>[], rowId: (row: T) => string }

function TableGridRow<T>({row, columns}: { row: T, columns: TableGridColumn<T>[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })
  return (
    <Grid2 container spacing={SizesAndSpaces.Spacing.xxs} maxHeight={1088} sx={{ overflowY: 'auto' }} ref={ref}>
      {entry?.isIntersecting && columns.map(({ component: Component, key, size }) => (
        <Grid2
          key={key}
          size={size}
          paddingX={SizesAndSpaces.Spacing.sm}
          paddingY={SizesAndSpaces.Spacing.md}
          height={SizesAndSpaces.Sizing['3xl']}
          borderBottom="1px solid"
          borderColor="divider"
        >
          <Component data={row} />
        </Grid2>
      ))}
    </Grid2>
  )
}

export const TableGrid = <T extends unknown>({ columns, data, rowId }: TableGridProps<T>) => (
  <Box>
    <Grid2 container sx={{ backgroundColor: (t) => t.design.Table.Header_Fill }} spacing={SizesAndSpaces.Spacing.xxs}>
      {columns.map(({ key, size, title }) => (
        <Grid2 key={key} size={size} height={SizesAndSpaces.Sizing['3xl']} alignContent="end">
          <Typography variant="tableHeaderS" color="textSecondary">
            {title}
          </Typography>
        </Grid2>
      ))}
    </Grid2>
    {data.map((row) => <TableGridRow key={rowId(row)} row={row} columns={columns} />)}
  </Box>
)
