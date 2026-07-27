import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import { type BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { MarketInfoLayout } from './MarketInfoLayout'

export const MarketAdvancedDetailsCard = ({ network }: { network: BaseConfig | undefined }) => (
  <Card size="small" data-testid="market-parameters-card">
    <MarketCardHeader title={t`Advanced details`} />
    <CardContent
      component={Stack}
      // MarketInfoLayout handles the padding block
      sx={{ '&&': { paddingBlock: 0 }, '&&:last-child': { paddingBlockEnd: 0 } }}
    >
      <MarketInfoLayout network={network} />
    </CardContent>
  </Card>
)
