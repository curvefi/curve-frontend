import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { Nullish } from '@primitives/objects.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { constQ, DISABLED_Q, q, type QueryProp } from '@ui/features/queries/util'
import { QueryCell } from './QueryCell'

const VALUE = '$1.45'
const error = new Error('Could not load the position stats')

const STATES: { label: string; query: QueryProp<string | Nullish> }[] = [
  { label: 'Loading', query: q({ data: undefined, isLoading: true, error: null }) },
  { label: 'Loading, with data', query: q({ data: VALUE, isLoading: true, error: null }) },
  { label: 'Loaded', query: constQ(VALUE) },
  { label: 'Loaded, null data', query: constQ(null) },
  { label: 'Disabled', query: DISABLED_Q },
  { label: 'Failed, no data', query: q({ data: undefined, isLoading: false, error }) },
  { label: 'Failed, null data', query: q({ data: null, isLoading: false, error }) },
  { label: 'Failed, still loading', query: q({ data: undefined, isLoading: true, error }) },
  { label: 'Failed, loading with data', query: q({ data: VALUE, isLoading: true, error }) },
  { label: 'Failed refetch, with data', query: q({ data: VALUE, isLoading: false, error }) },
]

const Cell = ({ query }: { query: QueryProp<string | Nullish> }) => (
  <QueryCell query={query}>
    <Typography variant="tableCellValue">{query.data ?? '-'}</Typography>
  </QueryCell>
)

const meta: Meta<typeof QueryCell> = { title: 'UI/Tables/QueryCell', component: QueryCell }

type Story = StoryObj<typeof QueryCell>

export const AllStates: Story = {
  render: () => (
    <Table sx={{ width: 520 }}>
      <TableHead>
        <TableRow>
          <TableCell>State</TableCell>
          <TableCell align="right">Right aligned</TableCell>
          <TableCell align="left">Left aligned</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {STATES.map(({ label, query }) => (
          <TableRow key={label} data-testid={`query-cell-${label}`}>
            <TableCell>{label}</TableCell>
            <TableCell align="right">
              <Cell query={query} />
            </TableCell>
            <TableCell align="left">
              <Cell query={query} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export default meta
