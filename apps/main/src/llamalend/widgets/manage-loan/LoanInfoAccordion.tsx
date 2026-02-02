import { UserState } from '@/llamalend/queries/user-state.query'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { combineQueryState } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { FireIcon } from '@ui-kit/shared/icons/FireIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Query } from '@ui-kit/types/util'
import { type Amount, Decimal, formatNumber, formatPercent, formatUsd } from '@ui-kit/utils'
import { SlippageToleranceActionInfoPure } from '@ui-kit/widgets/SlippageSettings'
import { getHealthValueColor } from '../../features/market-position-details/utils'

const format = (value: Amount | null | undefined, symbol?: string) =>
  value == null ? '-' : notFalsy(formatNumber(value, { abbreviate: true }), symbol).join(' ')
const formatLeverage = (value: Amount | null | undefined) =>
  value == null ? '-' : formatNumber(value, { abbreviate: false, decimals: 2, unit: 'multiplier' })

export type LoanInfoGasData = {
  estGasCostUsd?: number | Decimal | `${number}`
  tooltip?: string
}

export type LoanInfoAccordionProps = {
  isOpen: boolean
  toggle: () => void
  range?: number
  isApproved?: boolean
  health: Query<Decimal | null>
  prevHealth?: Query<Decimal>
  isFullRepay?: boolean
  bands?: Query<[number, number]>
  prices?: Query<readonly Decimal[]>
  rates: Query<{ borrowApr?: Decimal } | null>
  prevRates?: Query<{ borrowApr?: Decimal } | null>
  loanToValue: Query<Decimal | null>
  prevLoanToValue?: Query<Decimal | null>
  netBorrowApr?: Query<Decimal | null>
  pnl?: Query<Decimal | null>
  gas: Query<LoanInfoGasData | null>
  debt?: Query<{ value: Decimal; tokenSymbol: string | undefined } | null>
  collateral?: Query<{ value: Decimal; tokenSymbol: string | undefined } | null>
  // userState values are used as prev values if collateral or debt are available
  userState?: Query<UserState>
  prevLeverageValue?: Query<Decimal | null>
  leverageValue?: Query<Decimal | null>
  prevLeverageCollateral?: Query<Decimal | null>
  leverageCollateral?: Query<Decimal | null>
  prevLeverageTotalCollateral?: Query<Decimal | null>
  leverageTotalCollateral?: Query<Decimal | null>
  priceImpact?: Query<number | null>
  slippage?: Decimal
  onSlippageChange?: (newSlippage: Decimal) => void
  collateralSymbol?: string
  /** Whether to show leverage-related fields (leverage value, leverage collateral...) */
  leverageEnabled?: boolean
}

const { Spacing } = SizesAndSpaces

export const LoanInfoAccordion = ({
  isOpen,
  toggle,
  range,
  isApproved,
  health,
  prevHealth,
  isFullRepay,
  bands,
  prices,
  prevRates,
  rates,
  loanToValue,
  prevLoanToValue,
  netBorrowApr,
  pnl,
  gas,
  debt,
  collateral,
  userState,
  prevLeverageValue,
  leverageValue,
  prevLeverageCollateral,
  leverageCollateral,
  prevLeverageTotalCollateral,
  leverageTotalCollateral,
  priceImpact,
  slippage,
  onSlippageChange,
  collateralSymbol,
  leverageEnabled,
}: LoanInfoAccordionProps) => {
  const prevDebt = userState?.data?.debt
  const prevCollateral = userState?.data?.collateral
  const isHighImpact = priceImpact?.data != null && slippage != null && priceImpact.data > Number(slippage)
  return (
    // error tooltip isn't displayed correctly because accordion takes the mouse focus. Use title for now.
    <Box title={(health.error ?? prevHealth?.error)?.message}>
      <Accordion
        ghost
        title={t`Health`}
        testId="loan-info-accordion"
        info={
          <ActionInfo
            label=""
            value={isFullRepay ? '∞' : health?.data && formatNumber(health.data, { abbreviate: false })}
            prevValue={prevHealth?.data && formatNumber(prevHealth.data, { abbreviate: false })}
            emptyValue="∞"
            {...combineQueryState(health, prevHealth)}
            valueColor={getHealthValueColor({
              health: health.data,
              prevHealth: prevHealth?.data,
              theme: useTheme(),
              isFullRepay,
            })}
            testId="borrow-health"
          />
        }
        expanded={isOpen}
        toggle={toggle}
      >
        <Stack gap={Spacing.sm}>
          <Stack>
            {(collateral || prevCollateral) && (
              <ActionInfo
                label={t`Collateral`}
                value={isFullRepay ? 0 : collateral?.data && formatNumber(collateral.data.value, { abbreviate: false })}
                prevValue={prevCollateral && formatNumber(prevCollateral, { abbreviate: false })}
                {...combineQueryState(collateral, userState)}
                valueRight={collateral?.data?.tokenSymbol ?? collateralSymbol}
                testId="borrow-collateral"
              />
            )}
            {(debt || prevDebt) && (
              <ActionInfo
                label={t`Debt`}
                value={debt?.data && formatNumber(debt.data.value, { abbreviate: false })}
                prevValue={prevDebt && formatNumber(prevDebt, { abbreviate: false })}
                {...combineQueryState(debt, userState)}
                valueRight={debt?.data?.tokenSymbol}
                testId="borrow-debt"
              />
            )}
            {isFullRepay && userState && (
              <ActionInfo
                label={t`Withdraw amount`}
                value={
                  userState.data &&
                  `${formatNumber(userState.data.collateral, { abbreviate: true })} ${collateralSymbol}`
                }
                {...combineQueryState(userState)}
              />
            )}
            <ActionInfo
              label={t`Borrow APR`}
              value={rates.data?.borrowApr && formatPercent(rates.data.borrowApr)}
              prevValue={prevRates?.data?.borrowApr && formatPercent(prevRates.data.borrowApr)}
              {...combineQueryState(rates, prevRates)}
              testId="borrow-apr"
            />
            {netBorrowApr && (
              <ActionInfo
                label={t`Net borrow APR`}
                value={netBorrowApr.data && formatPercent(netBorrowApr.data)}
                {...combineQueryState(netBorrowApr)}
                testId="borrow-net-apr"
              />
            )}
            {(loanToValue || prevLoanToValue) && (
              <ActionInfo
                label={
                  <Tooltip title={t`Loan to value ratio`} placement="top">
                    <span>{t`LTV`}</span>
                  </Tooltip>
                }
                value={loanToValue?.data && formatPercent(loanToValue.data)}
                prevValue={prevLoanToValue?.data && formatPercent(prevLoanToValue.data)}
                {...combineQueryState(loanToValue, prevLoanToValue)}
                testId="borrow-ltv"
              />
            )}
            {bands && !isFullRepay && (
              <ActionInfo
                label={t`Bands`}
                value={bands.data && `${bands.data[0]} to ${bands.data[1]}`}
                error={bands.error}
                loading={bands.isLoading}
                testId="borrow-band-range"
              />
            )}
            {prices && !isFullRepay && (
              <ActionInfo
                label={t`Liquidation zone`}
                value={prices.data?.map((p) => formatNumber(p, { abbreviate: false })).join(' - ')}
                valueRight={debt?.data?.tokenSymbol}
                error={prices.error}
                loading={prices.isLoading}
                testId="borrow-price-range"
              />
            )}
            {range != null && (
              <ActionInfo
                label={t`N`}
                value={formatNumber(range, { decimals: 0, abbreviate: false })}
                testId="borrow-n"
              />
            )}
          </Stack>

          {leverageEnabled && (
            <Stack>
              {(prevLeverageValue || leverageValue) && (
                <ActionInfo
                  label={t`Leverage`}
                  value={formatLeverage(leverageValue?.data ?? prevLeverageValue?.data)}
                  prevValue={leverageValue?.data && prevLeverageValue?.data && formatLeverage(prevLeverageValue.data)}
                  {...combineQueryState(leverageValue, prevLeverageValue)}
                  testId="borrow-leverage"
                />
              )}
              {pnl && (
                <ActionInfo
                  label={t`PNL`}
                  value={pnl.data && formatNumber(pnl.data, { abbreviate: false })}
                  valueRight={collateralSymbol}
                  {...combineQueryState(pnl)}
                  testId="borrow-pnl"
                />
              )}
              {(prevLeverageCollateral || leverageCollateral) && (
                <ActionInfo
                  label={t`Leverage collateral`}
                  value={format(leverageCollateral?.data ?? prevLeverageCollateral?.data, collateralSymbol)}
                  prevValue={
                    leverageCollateral?.data &&
                    prevLeverageCollateral?.data &&
                    format(prevLeverageCollateral.data, collateralSymbol)
                  }
                  {...combineQueryState(leverageCollateral, prevLeverageCollateral)}
                  testId="borrow-leverage-collateral"
                />
              )}
              {(prevLeverageTotalCollateral || leverageTotalCollateral) && (
                <ActionInfo
                  label={t`Total collateral`}
                  value={format(leverageTotalCollateral?.data ?? prevLeverageTotalCollateral?.data, collateralSymbol)}
                  prevValue={
                    leverageTotalCollateral?.data &&
                    prevLeverageTotalCollateral?.data &&
                    format(prevLeverageTotalCollateral.data, collateralSymbol)
                  }
                  {...combineQueryState(leverageTotalCollateral, prevLeverageTotalCollateral)}
                  testId="borrow-leverage-total-collateral"
                />
              )}
            </Stack>
          )}

          <Stack>
            {slippage && onSlippageChange && (
              <SlippageToleranceActionInfoPure maxSlippage={slippage} onSave={onSlippageChange} />
            )}
            {priceImpact && (
              <ActionInfo
                label={isHighImpact ? t`High price impact` : t`Price impact`}
                value={formatPercent(priceImpact.data)}
                {...(isHighImpact && { valueColor: 'error' })}
                error={priceImpact.error}
                loading={priceImpact.isLoading}
                testId="borrow-price-impact"
              />
            )}
            <ActionInfo
              label={
                <>
                  {t`Estimated tx cost`}
                  <Typography color="textTertiary" component="span" variant="bodyXsRegular">
                    {isApproved === true && ` ${t`step 2/2`}`}
                    {isApproved === false && ` ${t`step 1/2`}`}
                  </Typography>
                </>
              }
              value={gas.data?.estGasCostUsd == null ? undefined : formatUsd(gas.data.estGasCostUsd)}
              valueTooltip={gas.data?.tooltip}
              loading={gas.isLoading}
              valueLeft={<FireIcon fontSize="small" />}
            />
          </Stack>
        </Stack>
      </Accordion>
    </Box>
  )
}
