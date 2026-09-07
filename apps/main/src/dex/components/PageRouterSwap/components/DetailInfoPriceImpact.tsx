import { formatNumber } from '@evm-ui/utils'
import { PriceImpactActionInfo } from '@evm-ui/widgets/DetailPageLayout/PriceImpactActionInfo'
import { TooltipIcon as IconTooltip } from '@legacy-ui/Tooltip/TooltipIcon'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export const DetailInfoPriceImpact = ({ priceImpact }: { priceImpact: QueryProp<Decimal | null> }) => (
  <PriceImpactActionInfo
    priceImpact={priceImpact}
    value={mapQuery(priceImpact, priceImpact => formatNumber(priceImpact, 'percent.price-impact'))}
    valueTooltip={
      <IconTooltip placement="top-end" minWidth="250px">
        {t`Price change in the market that happens when a trader buys or sells an asset.`}
      </IconTooltip>
    }
    skeleton={[80, 23]}
    testId="price-impact"
  />
)
