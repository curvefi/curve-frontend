import { formatPercent } from '@/llamalend/format.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@ui/utils'
import { SlippageSettings } from '@ui-kit/features/slippage-settings'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { getHealthValueColor } from '../../market-position-details/utils'
import { useLoanToValue } from '../hooks/useLoanToValue'
import { useMarketRates } from '../queries/borrow-apy.query'
import { useBorrowBands } from '../queries/borrow-bands.query'
import { useMarketFutureRates } from '../queries/borrow-future-apy.query'
import { useBorrowEstimateGas } from '../queries/borrow-gas-estimate.query'
import { useBorrowHealth } from '../queries/borrow-health.query'
import { useBorrowPrices } from '../queries/borrow-prices.query'
import { type BorrowForm, type BorrowFormQueryParams, type Token } from '../types'
import { BorrowLeverageActionInfos } from './BorrowLeverageActionInfos'

/**
 * Accordion with action infos about the borrow action (like health, band range, price range, N, borrow APR, LTV, estimated gas, slippage)
 * By default, only the health info is visible. The rest is visible when the accordion is expanded.
 * When leverage is enabled, `BorrowLeverageActionInfos` is also included.
 */
export const BorrowActionInfoAccordion = <ChainId extends IChainId>({
  params,
  values: { range, slippage, debt, userCollateral, leverageEnabled },
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
  const { data: bands, isLoading: bandsLoading, error: bandsError } = useBorrowBands(params, isOpen && !tooMuchDebt)
  const { data: prices, isLoading: pricesLoading, error: pricesError } = useBorrowPrices(params, isOpen && !tooMuchDebt)
  const { data: rates, isLoading: ratesLoading, error: ratesError } = useMarketRates(params, isOpen)
  const {
    data: futureRates,
    isLoading: futureRatesLoading,
    error: futureRatesError,
  } = useMarketFutureRates(params, isOpen)
  const { data: gas, isLoading: gasLoading } = useBorrowEstimateGas(networks, params, isOpen && !tooMuchDebt)
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
            <BorrowLeverageActionInfos
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
            prevValue={formatPercent(rates?.borrowApr)}
            value={futureRates?.borrowApr ? formatPercent(futureRates?.borrowApr) : '...'}
            error={ratesError || futureRatesError}
            loading={ratesLoading || futureRatesLoading}
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
    </Box>
  )
}
