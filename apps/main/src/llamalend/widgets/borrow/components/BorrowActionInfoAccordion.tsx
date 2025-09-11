import { getHealthValueColor } from '@/llamalend/features/market-position-details/utils'
import { formatPercent } from '@/llamalend/utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@ui/utils'
import { SlippageSettings } from '@ui-kit/features/slippage-settings'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type BorrowForm, type BorrowFormQueryParams, type Token } from '../borrow.types'
import { useMarketRates } from '../queries/borrow-apy.query'
import { useBorrowBands } from '../queries/borrow-bands.query'
import { useBorrowHealth } from '../queries/borrow-health.query'
import { useBorrowPriceImpact } from '../queries/borrow-price-impact.query'
import { useBorrowPrices } from '../queries/borrow-prices.query'

const { IconSize } = SizesAndSpaces

const useLoanToValue = ({
  chainId,
  collateralToken,
  debt,
  userCollateral,
}: {
  chainId: IChainId
  debt: number | undefined
  userCollateral: number | undefined
  collateralToken: Token | undefined
}) => {
  const tokenAddress = collateralToken?.address
  const { data: collateralUsdRate } = useTokenUsdRate({ chainId, tokenAddress })
  const collateralValue = collateralUsdRate != null && userCollateral != null && userCollateral * collateralUsdRate
  return collateralValue && debt != null ? (debt / collateralValue) * 100 : null
}

export const BorrowActionInfoAccordion = ({
  params,
  values: { range, slippage, debt, userCollateral },
  collateralToken,
  tooMuchDebt,
  onSlippageChange,
}: {
  params: BorrowFormQueryParams
  values: BorrowForm
  collateralToken: Token | undefined
  tooMuchDebt: boolean
  onSlippageChange: (newSlippage: string) => void
}) => {
  const [isOpen, , , toggle] = useSwitch(false)
  const {
    data: priceImpactPercent,
    isLoading: priceImpactPercentLoading,
    error: priceImpactPercentError,
  } = useBorrowPriceImpact(params, isOpen)
  const { data: bands, isLoading: bandsLoading, error: bandsError } = useBorrowBands(params, isOpen && !tooMuchDebt)
  const { data: prices, isLoading: pricesLoading, error: pricesError } = useBorrowPrices(params, isOpen && !tooMuchDebt)
  const { data: health, isLoading: healthLoading, error: healthError } = useBorrowHealth(params, !tooMuchDebt)
  const { data: rates, isLoading: ratesLoading, error: ratesError } = useMarketRates(params, isOpen)
  const loanToValue = useLoanToValue({ debt, userCollateral, chainId: params.chainId!, collateralToken })
  const theme = useTheme()

  const isHighImpact = priceImpactPercent != null && priceImpactPercent > slippage

  return (
    <Accordion
      ghost
      title={t`Health`}
      info={
        <ActionInfo
          label=""
          value={health == null ? '∞' : formatNumber(health)}
          valueColor={getHealthValueColor(health ?? 100, theme)}
          error={healthError}
          loading={healthLoading}
        />
      }
      expanded={isOpen}
      toggle={toggle}
    >
      <Stack>
        <ActionInfo
          label={isHighImpact ? t`High price impact` : t`Price impact`}
          value={formatNumber(priceImpactPercent, { defaultValue: '-' })}
          valueRight={priceImpactPercent != null && '%'}
          {...(isHighImpact && { valueColor: 'error' })}
          error={priceImpactPercentError}
          loading={priceImpactPercentLoading}
        />
        <ActionInfo
          label={t`Band range`}
          value={bands ? `${bands[0]} to ${bands[1]}` : '?'}
          error={bandsError}
          loading={bandsLoading}
        />
        <ActionInfo
          label={t`Price range`}
          value={prices?.map((p) => formatNumber(p, { maximumSignificantDigits: 3 })).join(' - ') ?? '?'}
          error={pricesError}
          loading={pricesLoading}
        />
        <ActionInfo label={t`N`} value={formatNumber(range)} />
        <ActionInfo
          label={t`Borrow APR`}
          value={formatPercent(rates?.borrowApr)}
          error={ratesError}
          loading={ratesLoading}
        />
        {loanToValue != null && <ActionInfo label={t`Loan to value ratio`} value={formatPercent(loanToValue)} />}
        {/*TODO <ActionInfo label={t`Estimated tx cost (step 1 of 2)`} value="~0.00 ETH" />*/}
        <ActionInfo
          label={t`Slippage tolerance`}
          value={formatNumber(slippage)}
          valueRight={
            <SlippageSettings
              buttonSize="extraSmall"
              buttonIcon={<GearIcon sx={{ color: 'text.primary' }} />}
              maxSlippage={`${slippage}`}
              onSave={onSlippageChange}
            />
          }
        />
      </Stack>
    </Accordion>
  )
}
