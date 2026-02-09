import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MinHeight, Sizing } = SizesAndSpaces
const ROW_COUNT = 10
const HEADER_LABELS = ['Pool', 'Rewards', 'Volume', 'TVL']
const CELL_WIDTHS = ['84%', '62%', '70%', '56%'] as const

export const PoolListRouteFallback = () => (
  <Box
    sx={{
      marginBlockStart: Spacing.xl,
      marginBlockEnd: Spacing.xxl,
      minHeight: MinHeight.pageContent,
      backgroundColor: (t) => t.design.Layer[1].Fill,
      border: (t) => `1px solid ${t.design.Layer[1].Outline}`,
    }}
  >
    <Table sx={{ borderCollapse: 'separate' }}>
      <TableHead
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: (t) => t.zIndex.tableHeader,
          backgroundColor: (t) => t.design.Table.Header.Fill,
        }}
      >
        <TableRow sx={{ height: Sizing.xxl }}>
          {HEADER_LABELS.map((label) => (
            <TableCell key={label}>
              <Typography variant="tableTitle">{label}</Typography>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {Array.from({ length: ROW_COUNT }).map((_, rowIndex) => (
          <TableRow key={`pools-route-skeleton-${rowIndex}`}>
            {HEADER_LABELS.map((_, columnIndex) => (
              <TableCell key={`pools-route-skeleton-${rowIndex}-${columnIndex}`}>
                <Skeleton
                  animation="wave"
                  variant="text"
                  width={CELL_WIDTHS[(rowIndex + columnIndex) % CELL_WIDTHS.length]}
                  height={20}
                  sx={{ transform: 'none' }}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
)
