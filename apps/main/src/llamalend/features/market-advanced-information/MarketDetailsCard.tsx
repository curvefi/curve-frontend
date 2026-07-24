import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import { type BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketOverviewDetails } from './AdvancedDetails'
import { MarketInfoLayout } from './MarketInfoLayout'

const { Padding } = SizesAndSpaces

export const MarketOverviewCard = () => (
  <Card data-testid="market-overview-card">
    <MarketCardHeader title={t`Overview`} />
    <CardContent
      component={Stack}
      sx={{
        '&&': { padding: Padding.Card.sm },
        '&&:last-child': { paddingBlockEnd: Padding.Card.sm },
      }}
    >
      <MarketOverviewDetails />
    </CardContent>
  </Card>
)

export const MarketParametersCard = ({ network }: { network: BaseConfig | undefined }) => (
  <Card size="small" data-testid="market-parameters-card">
    <MarketCardHeader title={t`Advanced details`} />
    <CardContent component={Stack} sx={{ '&&': { paddingBlock: 0 }, '&&:last-child': { paddingBlockEnd: 0 } }}>
      <MarketInfoLayout network={network} />
    </CardContent>
  </Card>
)
