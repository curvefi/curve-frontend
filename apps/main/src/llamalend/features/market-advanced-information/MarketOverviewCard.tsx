import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketOverviewDetails } from './AdvancedDetails'

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
