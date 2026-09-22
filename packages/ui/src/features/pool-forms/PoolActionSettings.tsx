import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { PriceImpactActionInfo } from '@ui/features/forms/action-info/PriceImpactActionInfo'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { borderStyle } from '@ui/lib/mui'
import { formatToken } from '@ui/lib/tokens'

const { Spacing } = SizesAndSpaces

/** Pool counterpart to LlamaLend's LoanActionSettings. */
export const PoolActionSettings = ({
  priceImpact,
  slippage,
  onSlippageChange,
  userAddress,
  exchangeRate,
  fromSymbol,
  toSymbol,
  show = true,
}: {
  priceImpact: QueryProp<Decimal | null>
  slippage: Decimal
  onSlippageChange: (slippage: Decimal) => void
  userAddress: Address | undefined
  exchangeRate?: QueryProp<Decimal>
  fromSymbol?: string
  toSymbol?: string
  show?: boolean
}) => (
  <Collapse in={show}>
    <Stack
      data-testid="pool-action-settings"
      sx={{ backgroundColor: t => t.design.Layer[2].Fill, border: borderStyle, padding: Spacing.xs }}
    >
      <SlippageToleranceActionInfo
        maxSlippage={slippage}
        onChanged={({ stable }) => onSlippageChange(stable)}
        type="stable"
        userAddress={userAddress}
        size="small"
      />
      {exchangeRate && (
        <ActionInfo
          label={t`Exchange rate`}
          value={mapQuery(exchangeRate, value =>
            [formatToken(1, fromSymbol), formatToken(value, toSymbol, 'balance')].join(' = '),
          )}
          size="small"
          testId="pool-swap-exchange-rate"
        />
      )}
      <PriceImpactActionInfo
        testId="pool-price-impact"
        priceImpact={priceImpact}
        value={mapQuery(priceImpact, value => formatNumber(value, 'percent.price-impact'))}
        size="small"
      />
    </Stack>
  </Collapse>
)
