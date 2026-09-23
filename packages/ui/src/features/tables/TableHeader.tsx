import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { ReloadIcon } from '@ui/icons/ReloadIcon'
import { TableButton } from './TableButton'

export const TableHeader = ({
  title,
  onReload,
  isLoading,
  testId,
}: {
  title: string
  onReload: () => Promise<unknown>
  isLoading: boolean
  testId?: string
}) => (
  <Stack
    direction="row"
    sx={{ justifyContent: 'space-between', alignItems: 'end', backgroundColor: t => t.design.Layer.App.Background }}
  >
    <CardHeader title={title} data-testid={testId} />
    <TableButton onClick={() => void onReload()} icon={ReloadIcon} rotateIcon={isLoading} />
  </Stack>
)
