import { getHealthValueColor } from '@/llamalend/features/market-position-details/utils'
import { formatPercent } from '@/llamalend/utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Box from '@mui/material/Box'
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
import { type BorrowForm, type BorrowFormQueryParams, type Token } from '../borrow.types'
import { useMarketRates } from '../queries/borrow-apy.query'
import { useBorrowBands } from '../queries/borrow-bands.query'
import { useBorrowExpectedCollateral } from '../queries/borrow-expected-collateral.query'
import { useBorrowHealth } from '../queries/borrow-health.query'
import { useMaxBorrowReceive } from '../queries/borrow-max-receive.query'
import { useBorrowPriceImpact } from '../queries/borrow-price-impact.query'
import { useBorrowPrices } from '../queries/borrow-prices.query'

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

export const LeverageActionInfos = ({
  params,
  collateralToken,
  isOpen,
  slippage,
}: {
  params: BorrowFormQueryParams
  isOpen: boolean
  collateralToken: Token | undefined
  slippage: number
}) => {
  const {
    data: expectedCollateral,
    isLoading: expectedCollateralLoading,
    error: expectedCollateralError,
  } = useBorrowExpectedCollateral(params, isOpen)

  const {
    data: maxBorrowReceive,
    isLoading: maxBorrowReceiveLoading,
    error: maxBorrowReceiveError,
  } = useMaxBorrowReceive(params, isOpen)

  const { totalCollateral, leverage } = expectedCollateral ?? {}
  const { avgPrice, maxLeverage } = maxBorrowReceive ?? {}

  const {
    data: priceImpactPercent,
    isLoading: priceImpactPercentLoading,
    error: priceImpactPercentError,
  } = useBorrowPriceImpact(params, isOpen)
  const isHighImpact = priceImpactPercent != null && priceImpactPercent > slippage

  return (
    <>
      <ActionInfo
        label={t`Leverage`}
        value={formatNumber(leverage, { defaultValue: '1', maximumFractionDigits: 0 })}
        valueRight={
          leverage != null && maxLeverage && ` (max ${formatNumber(maxLeverage, { maximumFractionDigits: 0 })})`
        }
        error={expectedCollateralError || maxBorrowReceiveError}
        loading={expectedCollateralLoading || maxBorrowReceiveLoading}
      />
      <ActionInfo
        label={t`Expected`}
        value={formatNumber(totalCollateral, { currency: collateralToken?.symbol, defaultValue: '-' })}
        error={expectedCollateralError}
        loading={expectedCollateralLoading}
      />
      <ActionInfo
        label={t`Expected avg. price`}
        value={formatNumber(avgPrice, { defaultValue: '-' })}
        error={maxBorrowReceiveError}
        loading={maxBorrowReceiveLoading}
      />
      <ActionInfo
        label={isHighImpact ? t`High price impact` : t`Price impact`}
        value={formatNumber(priceImpactPercent, { defaultValue: '-' })}
        valueRight={priceImpactPercent != null && '%'}
        {...(isHighImpact && { valueColor: 'error' })}
        error={priceImpactPercentError}
        loading={priceImpactPercentLoading}
        testId="borrow-price-impact"
      />
    </>
  )
}

type BorrowActionInfoAccordionProps = {
  params: BorrowFormQueryParams
  values: BorrowForm
  collateralToken: Token | undefined
  tooMuchDebt: boolean
  onSlippageChange: (newSlippage: string) => void
}

export const BorrowActionInfoAccordion = ({
  params,
  values: { range, slippage, debt, userCollateral, leverageEnabled },
  collateralToken,
  tooMuchDebt,
  onSlippageChange,
}: BorrowActionInfoAccordionProps) => {
  const [isOpen, , , toggle] = useSwitch(false)
  const { data: bands, isLoading: bandsLoading, error: bandsError } = useBorrowBands(params, isOpen && !tooMuchDebt)
  const { data: prices, isLoading: pricesLoading, error: pricesError } = useBorrowPrices(params, isOpen && !tooMuchDebt)
  const { data: health, isLoading: healthLoading, error: healthError } = useBorrowHealth(params, !tooMuchDebt)
  const { data: rates, isLoading: ratesLoading, error: ratesError } = useMarketRates(params, isOpen)
  const loanToValue = useLoanToValue({ debt, userCollateral, chainId: params.chainId!, collateralToken })
  const theme = useTheme()

  return (
    // error tooltip isn't displayed correctly because accordion takes the mouse focus. Use title for now.
    <Box title={healthError?.message}>
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
          {leverageEnabled && (
            <LeverageActionInfos
              isOpen={isOpen}
              collateralToken={collateralToken}
              params={params}
              slippage={slippage}
            />
          )}
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
          {/*TODO <ActionInfo label={t`Estimated tx cost (step 1 of 2)`} value="~0.00 ETH" />*/}
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
    </Box>
  )
}
