import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { PriceImpactActionInfo } from '@ui/features/forms/action-info/PriceImpactActionInfo'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/** Pool counterpart to LlamaLend's LoanActionSettings. */
export const PoolActionSettings = ({
  priceImpact,
  slippage,
  onSlippageChange,
  userAddress,
}: {
  priceImpact: QueryProp<Decimal | null>
  slippage: Decimal
  onSlippageChange: (slippage: Decimal) => void
  userAddress: Address | undefined
}) => (
  <Stack sx={{ backgroundColor: t => t.design.Layer[2].Fill, padding: Spacing.xs }}>
    <PriceImpactActionInfo
      testId="pool-price-impact"
      priceImpact={priceImpact}
      value={mapQuery(priceImpact, value => formatNumber(value, 'percent.price-impact'))}
      size="small"
    />
    <SlippageToleranceActionInfo
      maxSlippage={slippage}
      onChanged={({ stable }) => onSlippageChange(stable)}
      type="stable"
      userAddress={userAddress}
      size="small"
    />
  </Stack>
)
