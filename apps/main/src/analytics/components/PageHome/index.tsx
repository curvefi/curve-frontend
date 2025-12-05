import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ChartCrvUsdSupply } from './components/ChartCrvUsdSupply'

export const PageHome = () => (
  <Stack>
    <Typography data-testid="new-app">hello world</Typography>
    <ChartCrvUsdSupply />
  </Stack>
)
