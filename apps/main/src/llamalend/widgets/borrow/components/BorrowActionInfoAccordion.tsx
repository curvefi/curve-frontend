import { getHealthValueColor } from '@/llamalend/features/market-position-details/utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { formatPercent } from '@/llamalend/utils'
import { useBorrowEstimateGas } from '@/llamalend/widgets/borrow/queries/borrow-gas-estimate.query'
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

export const BorrowActionInfoAccordion = <ChainId extends IChainId>({
  params,
  values: { range, slippage, debt, userCollateral },
  collateralToken,
  tooMuchDebt,
  networks,
  onSlippageChange,
}: {
  params: BorrowFormQueryParams<ChainId>
  values: BorrowForm
  collateralToken: Token | undefined
  tooMuchDebt: boolean
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: string) => void
}) => {
  const [isOpen, , , toggle] = useSwitch(false)
  const { data: health, isLoading: healthLoading, error: healthError } = useBorrowHealth(params, !tooMuchDebt) // visible when !isOpen
  const {
    data: priceImpactPercent,
    isLoading: priceImpactPercentLoading,
    error: priceImpactPercentError,
  } = useBorrowPriceImpact(params, isOpen)
  const { data: bands, isLoading: bandsLoading, error: bandsError } = useBorrowBands(params, isOpen && !tooMuchDebt)
  const { data: prices, isLoading: pricesLoading, error: pricesError } = useBorrowPrices(params, isOpen && !tooMuchDebt)
  const { data: rates, isLoading: ratesLoading, error: ratesError } = useMarketRates(params, isOpen)
  const { data: gas, isLoading: gasLoading } = useBorrowEstimateGas(networks, params, isOpen && !tooMuchDebt)
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
          testId="borrow-health"
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
          testId="borrow-price-impact"
        />
        <ActionInfo
          label={t`Band range`}
          value={bands ? `${bands[0]} to ${bands[1]}` : '?'}
          error={bandsError}
          loading={bandsLoading}
          testId="borrow-band-range"
        />
        <ActionInfo
          label={t`Price range`}
          value={prices?.map((p) => formatNumber(p, { maximumSignificantDigits: 3 })).join(' - ') ?? '?'}
          error={pricesError}
          loading={pricesLoading}
          testId="borrow-price-range"
        />
        <ActionInfo label={t`N`} value={formatNumber(range)} testId="borrow-n" />
        <ActionInfo
          label={t`Borrow APR`}
          value={formatPercent(rates?.borrowApr)}
          error={ratesError}
          loading={ratesLoading}
          testId="borrow-apr"
        />
        {loanToValue != null && (
          <ActionInfo label={t`Loan to value ratio`} value={formatPercent(loanToValue)} testId="borrow-ltv" />
        )}
        <ActionInfo
          label={t`Estimated tx cost (step 1 of 2)`}
          value={formatNumber(gas?.createLoanApprove?.estGasCostUsd, { currency: 'USD', defaultValue: '...' })}
          valueTooltip={gas?.createLoanApprove?.tooltip}
          loading={gasLoading}
        />
        <ActionInfo
          label={t`Slippage tolerance`}
          value={formatPercent(slippage)}
          valueRight={
            <SlippageSettings
              buttonSize="extraSmall"
              buttonIcon={<GearIcon sx={{ color: 'text.primary' }} />}
              maxSlippage={`${slippage}`}
              onSave={onSlippageChange}
            />
          }
          testId="borrow-slippage"
        />
      </Stack>
    </Accordion>
  )
}
