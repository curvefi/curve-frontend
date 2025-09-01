import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { getHealthValueColor } from '@ui-kit/features/market-position-details/utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ControlledAccordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { type BorrowForm, type BorrowFormQueryParams, type Token } from '../borrow.types'
import { useBorrowBands } from '../queries/borrow-bands.query'
import { useBorrowExpectedCollateral } from '../queries/borrow-expected-collateral.query'
import { useBorrowHealth } from '../queries/borrow-health.query'
import { useMaxBorrowReceive } from '../queries/borrow-max-receive.query'
import { useBorrowPriceImpact } from '../queries/borrow-price-impact.query'
import { useBorrowPrices } from '../queries/borrow-prices.query'

export const BorrowActionInfoAccordion = ({
  params,
  values: { range, slippage, leverage },
  collateralToken,
}: {
  params: BorrowFormQueryParams
  values: BorrowForm
  collateralToken: Token | undefined
}) => {
  const [isOpen, , , toggle] = useSwitch(false)
  const {
    data: expectedCollateral,
    isLoading: expectedCollateralLoading,
    error: expectedCollateralError,
  } = useBorrowExpectedCollateral(params, isOpen && !!leverage)
  const {
    data: priceImpactPercent,
    isLoading: priceImpactPercentLoading,
    error: priceImpactPercentError,
  } = useBorrowPriceImpact(params, isOpen)
  const { data: bands, isLoading: bandsLoading, error: bandsError } = useBorrowBands(params, isOpen)
  const { data: prices, isLoading: pricesLoading, error: pricesError } = useBorrowPrices(params, isOpen)
  const {
    data: maxBorrowReceive,
    isLoading: maxBorrowReceiveLoading,
    error: maxBorrowReceiveError,
  } = useMaxBorrowReceive(params, isOpen)
  const { data: health, isLoading: healthLoading, error: healthError } = useBorrowHealth(params)

  const { totalCollateral } = expectedCollateral ?? {}
  const { avgPrice, maxLeverage } = maxBorrowReceive ?? {}
  const isHighImpact = priceImpactPercent != null && priceImpactPercent > slippage

  return (
    <ControlledAccordion
      title={t`Health`}
      info={
        <Typography
          sx={{ ...(health && { color: (t) => getHealthValueColor(health, t) }) }}
          data-testid={JSON.stringify(params)}
        >
          {healthLoading ? '...' : healthError ? '!' : health ? formatNumber(health) : '∞'}
        </Typography>
      }
      isOpen={isOpen}
      toggle={toggle}
    >
      <Stack>
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
          value={formatNumber(totalCollateral, { showDecimalIfSmallNumberOnly: true })}
          valueRight={collateralToken?.symbol}
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
        {/*TODO <ActionInfo label={t`Borrow APY`} prevValue="1.56" value="1.56" valueRight="%" />*/}
        {/*TODO <ActionInfo label={t`Loan to value ratio`} value="131.89" valueRight="%" />*/}
        {/*TODO <ActionInfo label={t`Estimated tx cost (step 1 of 2)`} value="~0.00 ETH" />*/}
        <ActionInfo
          label={t`Slippage tolerance`}
          value={formatNumber(slippage)}
          // todo: valueRight={<SettingsIcon />}
        />
      </Stack>
    </ControlledAccordion>
  )
}
