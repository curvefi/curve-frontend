import { t } from '@evm-ui/lib/i18n'
import type { QueryProp } from '@evm-ui/types/util'
import { mapQuery } from '@evm-ui/types/util'
import { formatNumber } from '@evm-ui/utils'
import { PriceImpactActionInfo } from '@evm-ui/widgets/DetailPageLayout/PriceImpactActionInfo'
import { TooltipIcon as IconTooltip } from '@legacy-ui/Tooltip/TooltipIcon'
import type { Decimal } from '@primitives/decimal.utils'

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
