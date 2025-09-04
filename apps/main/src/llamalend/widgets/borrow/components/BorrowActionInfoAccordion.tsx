import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { getHealthValueColor } from '@ui-kit/features/market-position-details/utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { type BorrowForm, type BorrowFormQueryParams, type Token } from '../borrow.types'
import { useBorrowBands } from '../queries/borrow-bands.query'
import { useBorrowHealth } from '../queries/borrow-health.query'
import { useBorrowPriceImpact } from '../queries/borrow-price-impact.query'
import { useBorrowPrices } from '../queries/borrow-prices.query'

export const BorrowActionInfoAccordion = ({
  params,
  values: { range, slippage },
}: {
  params: BorrowFormQueryParams
  values: BorrowForm
  collateralToken: Token | undefined
}) => {
  const [isOpen, , , toggle] = useSwitch(false)
  const {
    data: priceImpactPercent,
    isLoading: priceImpactPercentLoading,
    error: priceImpactPercentError,
  } = useBorrowPriceImpact(params, isOpen)
  const { data: bands, isLoading: bandsLoading, error: bandsError } = useBorrowBands(params, isOpen)
  const { data: prices, isLoading: pricesLoading, error: pricesError } = useBorrowPrices(params, isOpen)
  const { data: health, isLoading: healthLoading, error: healthError } = useBorrowHealth(params)

  const isHighImpact = priceImpactPercent != null && priceImpactPercent > slippage

  return (
    <Accordion
      title={t`Health`}
      info={
        <Typography
          sx={{ ...(health && { color: (t) => getHealthValueColor(health, t) }) }}
          data-testid="borrow-health-value"
        >
          {healthLoading ? (
            '...'
          ) : healthError ? (
            <Tooltip title={healthError.message}>
              {/*todo: tooltip doesn't work because accordion takes the precen*/}
              <ExclamationTriangleIcon sx={{ color: (t) => t.design.Layer.Feedback.Error }} fontSize="small" />
            </Tooltip>
          ) : health ? (
            formatNumber(health)
          ) : (
            '∞'
          )}
        </Typography>
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
        {/*TODO <ActionInfo label={t`Borrow APY`} prevValue="1.56" value="1.56" valueRight="%" />*/}
        {/*TODO <ActionInfo label={t`Loan to value ratio`} value={formatPercent(debt / collateralValue * 100)} valueRight="%" />*/}
        {/*TODO <ActionInfo label={t`Estimated tx cost (step 1 of 2)`} value="~0.00 ETH" />*/}
        <ActionInfo
          label={t`Slippage tolerance`}
          value={formatNumber(slippage)}
          // todo: valueRight={<SettingsIcon />}
        />
      </Stack>
    </Accordion>
  )
}
