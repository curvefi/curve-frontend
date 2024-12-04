import Card from '@mui/material/Card'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableFilters } from '@ui-kit/shared/ui/TableFilters'
import {t} from '@lingui/macro'

const {Spacing, MaxWidth} = SizesAndSpaces

export const MarketsTable = ({ onReload }: { onReload: () => void }) => (
  <Card sx={{ paddingY: Spacing.xs, maxWidth: MaxWidth, backgroundColor: t => t.design.Layer[1].Fill }}>
    <TableFilters title={t`Llamalend Markets`} subtitle={t`Select a market to view more details`} onReload={onReload} />
  </Card>
)
