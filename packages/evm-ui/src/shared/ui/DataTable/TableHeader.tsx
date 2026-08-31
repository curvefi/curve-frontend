import { ReloadIcon } from '@evm-ui/shared/icons/ReloadIcon'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { TableButton } from './TableButton'

const { Spacing } = SizesAndSpaces

export const TableHeader = ({
  title,
  onReload,
  isLoading,
  testId,
}: {
  title: string
  onReload: () => void
  isLoading: boolean
  testId?: string
}) => (
  <Stack
    direction="row"
    sx={{
      justifyContent: 'space-between',
      alignItems: 'end',
      paddingBlockEnd: Spacing.xs,
      backgroundColor: t => t.design.Layer.App.Background,
    }}
  >
    <CardHeader title={title} data-testid={testId} />
    <TableButton onClick={onReload} icon={ReloadIcon} rotateIcon={isLoading} />
  </Stack>
)
