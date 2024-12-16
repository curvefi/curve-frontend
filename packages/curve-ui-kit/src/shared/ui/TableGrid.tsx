import { FunctionComponent, ReactNode, useRef } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import Grid, { type Grid2Props as GridProps } from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'
import { useIntersectionObserver } from 'ui'
import { Theme } from '@mui/material/styles'

type TableGridColumn<T> = {
  component: FunctionComponent<{ data: T }>
  size: GridProps['size']
  title: ReactNode
  key: string
}
type TableGridProps<T> = { data: T[]; columns: TableGridColumn<T>[]; rowId: (row: T) => string }

const { Sizing, Spacing } = SizesAndSpaces

const TableGridCell = <T extends unknown>({
  column: { component: Component, key, size, title },
  row,
  showTitle,
}: {
  column: TableGridColumn<T>
  row: T
  showTitle: boolean
}) => (
  <Grid
    key={key}
    size={size}
    height={Sizing['3xl']}
    display="flex"
    flexDirection="column"
    justifyContent={showTitle ? 'space-between' : 'flex-end'}
  >
    {showTitle && (
      <Typography
        variant="tableHeaderS"
        color="textSecondary"
        sx={{ backgroundColor: (t) => t.design.Table.Header_Fill, display: 'block' }}
      >
        {title}
      </Typography>
    )}
    <Box paddingInline={Spacing.sm} paddingBlock={Spacing.md}>
      <Component data={row} />
    </Box>
  </Grid>
)

const TableGridRow = <T extends unknown>({
  row,
  columns,
  showTitle,
  rowId,
}: {
  row: T
  columns: TableGridColumn<T>[]
  showTitle: boolean
  rowId: (row: T) => string
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })
  return (
    <Grid
      container
      spacing={Spacing.xxs}
      maxHeight={1088}
      sx={{ overflowY: 'auto', marginBlock: showTitle ? 6 : 0 }}
      ref={ref}
      borderBottom="1px solid"
      borderColor="divider"
    >
      {entry?.isIntersecting &&
        columns.map((column) => (
          <TableGridCell key={[column.key, rowId(row)].join('-')} column={column} row={row} showTitle={showTitle} />
        ))}
    </Grid>
  )
}

const TableHeaderCell = <T extends unknown>({ column: { size, title } }: { column: TableGridColumn<T> }) => (
  <Grid size={size} height={Sizing['3xl']} alignContent="end" padding={Spacing.sm} paddingTop={0}>
    <Typography variant="tableHeaderS" color="textSecondary">
      {title}
    </Typography>
  </Grid>
)

export const TableGrid = <T extends unknown>({ columns, data, rowId }: TableGridProps<T>) => {
  const isDesktop = useMediaQuery((t: Theme) => t.breakpoints.up('desktop'))
  return (
    <Box>
      {isDesktop && (
        <Grid container sx={{ backgroundColor: (t) => t.design.Table.Header_Fill }} spacing={Spacing.xxs}>
          {columns.map((col) => (
            <TableHeaderCell key={col.key} column={col} />
          ))}
        </Grid>
      )}
      {data.map((row) => (
        <TableGridRow<T> key={rowId(row)} rowId={rowId} row={row} columns={columns} showTitle={!isDesktop} />
      ))}
    </Box>
  )
}
