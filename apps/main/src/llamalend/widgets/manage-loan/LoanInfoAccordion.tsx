import { UserState } from '@/llamalend/queries/user-state.query'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { FireIcon } from '@ui-kit/shared/icons/FireIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { Query } from '@ui-kit/types/util'
import { Decimal, formatNumber, formatPercent, formatUsd } from '@ui-kit/utils'
import { getHealthValueColor } from '../../features/market-position-details/utils'
import { LoanLeverageActionInfo, type LoanLeverageActionInfoProps } from './LoanLeverageActionInfo'

export type LoanInfoGasData = {
  estGasCostUsd?: number | Decimal | `${number}`
  tooltip?: string
}

export type LoanLeverageExpectedCollateral = {
  totalCollateral: Decimal
  leverage: Decimal
}

export type LoanLeverageMaxReceive = {
  avgPrice?: Decimal
  maxLeverage?: Decimal
}

export type LoanInfoAccordionProps = {
  isOpen: boolean
  toggle: () => void
  range?: number
  health: Query<Decimal>
  prevHealth?: Query<Decimal>
  isFullRepay?: boolean
  bands?: Query<[number, number]>
  prices?: Query<readonly Decimal[]>
  rates: Query<{ borrowApr?: Decimal } | null>
  prevRates?: Query<{ borrowApr?: Decimal } | null>
  loanToValue: Query<Decimal | null>
  prevLoanToValue?: Query<Decimal | null>
  gas: Query<LoanInfoGasData | null>
  debt?: Query<{ value: Decimal; tokenSymbol?: string | undefined } | null>
  withdraw?: Query<{ value: Decimal; tokenSymbol?: string | undefined } | null>
  collateral?: Query<{ value: Decimal; tokenSymbol?: string } | null>
  // userState values are used as prev values if collateral or debt are available
  userState?: Query<UserState> & { borrowTokenSymbol?: string; collateralTokenSymbol?: string }
  leverage?: LoanLeverageActionInfoProps & { enabled: boolean }
}

const combineQueryState = (...queries: (Query<unknown> | undefined)[]) => ({
  error: queries.find((x) => x?.error)?.error,
  loading: queries.some((x) => x?.isLoading),
})

export const LoanInfoAccordion = ({
  isOpen,
  toggle,
  range,
  health,
  prevHealth,
  isFullRepay,
  bands,
  prices,
  prevRates,
  rates,
  loanToValue,
  prevLoanToValue,
  gas,
  debt,
  withdraw,
  collateral,
  leverage,
  userState,
}: LoanInfoAccordionProps) => {
  const prevDebt = userState?.data?.debt
  const prevCollateral = userState?.data?.collateral
  return (
    // error tooltip isn't displayed correctly because accordion takes the mouse focus. Use title for now.
    <Box title={(health.error ?? prevHealth?.error)?.message}>
      <Accordion
        ghost
        title={t`Health`}
        info={
          <ActionInfo
            label=""
            value={isFullRepay ? '∞' : health?.data && formatNumber(health.data, { abbreviate: false })}
            prevValue={prevHealth?.data && formatNumber(prevHealth.data, { abbreviate: false })}
            emptyValue="∞"
            {...combineQueryState(health, prevHealth)}
            valueColor={getHealthValueColor(Number(health.data ?? prevHealth?.data ?? 100), useTheme(), isFullRepay)}
            testId="borrow-health"
          />
        }
        expanded={isOpen}
        toggle={toggle}
      >
        <Stack>
          {withdraw && (
            <ActionInfo
              label={t`Withdraw amount`}
              value={
                withdraw.data &&
                `${formatNumber(withdraw.data.value, { abbreviate: true })} ${withdraw.data.tokenSymbol}`
              }
              error={withdraw.error}
              loading={withdraw.isLoading}
            />
          )}
          {(debt || prevDebt) && (
            <ActionInfo
              label={t`Debt`}
              value={debt?.data && formatNumber(debt.data.value, { abbreviate: false })}
              prevValue={prevDebt && formatNumber(prevDebt, { abbreviate: false })}
              {...combineQueryState(debt, userState)}
              valueRight={debt?.data?.tokenSymbol ?? userState?.borrowTokenSymbol}
              testId="borrow-debt"
            />
          )}
          {(collateral || prevCollateral) && (
            <ActionInfo
              label={t`Collateral`}
              value={collateral?.data && formatNumber(collateral.data.value, { abbreviate: false })}
              prevValue={prevCollateral && formatNumber(prevCollateral, { abbreviate: false })}
              {...combineQueryState(collateral, userState)}
              valueRight={collateral?.data?.tokenSymbol ?? userState?.collateralTokenSymbol}
              testId="borrow-collateral"
            />
          )}
          {bands && !isFullRepay && (
            <ActionInfo
              label={t`Band range`}
              value={bands.data && `${bands.data[0]} to ${bands.data[1]}`}
              error={bands.error}
              loading={bands.isLoading}
              testId="borrow-band-range"
            />
          )}
          {prices && !isFullRepay && (
            <ActionInfo
              label={t`Price range`}
              value={prices.data?.map((p) => formatNumber(p, { abbreviate: false })).join(' - ')}
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
          <ActionInfo
            label={t`Borrow APR`}
            value={rates.data?.borrowApr && formatPercent(rates.data.borrowApr)}
            prevValue={prevRates?.data?.borrowApr && formatPercent(prevRates.data.borrowApr)}
            {...combineQueryState(rates, prevRates)}
            testId="borrow-apr"
          />
          {(loanToValue || prevLoanToValue) && (
            <ActionInfo
              label={t`Loan to value ratio`}
              value={loanToValue?.data && formatPercent(loanToValue.data)}
              prevValue={prevLoanToValue?.data && formatPercent(prevLoanToValue.data)}
              {...combineQueryState(loanToValue, prevLoanToValue)}
              testId="borrow-ltv"
            />
          )}
          {leverage?.enabled && <LoanLeverageActionInfo {...leverage} />}
          {/* TODO: add router provider and slippage */}
          {/* TODO: add gas estimate steps (1. approve, 2. add collateral) */}
          <ActionInfo
            label={t`Estimated tx cost`}
            value={gas.data?.estGasCostUsd == null ? undefined : formatUsd(gas.data.estGasCostUsd)}
            valueTooltip={gas.data?.tooltip}
            loading={gas.isLoading}
            valueLeft={<FireIcon fontSize="small" />}
          />
        </Stack>
      </Accordion>
    </Box>
  )
}
