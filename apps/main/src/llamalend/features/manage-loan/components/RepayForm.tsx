import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import { useMarketFutureRates } from '@/llamalend/queries/market-future-rates.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useUserHealth } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { RepayFromCollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayForm as RepayFormValues } from '@/llamalend/queries/validation/manage-loan.validation'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import { LoanFormWrapper } from '@/llamalend/widgets/manage-loan/LoanFormWrapper'
import { LoanInfoAccordion } from '@/llamalend/widgets/manage-loan/LoanInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import type { Decimal } from '@ui-kit/utils'
import { InputDivider } from '../../../widgets/InputDivider'
import { setValueOptions } from '../../borrow/react-form.utils'
import { useRepayForm } from '../hooks/useRepayForm'

type RepayFormProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onRepaid: NonNullable<RepayOptions['onRepaid']>
  leverageEnabled: boolean
}

const useRepayInfo = <ChainId extends IChainId>({
  params,
  collateralToken,
  expectedBorrowed,
  values,
  isInfoOpen,
  collateralDelta,
}: {
  params: RepayFromCollateralParams<ChainId>
  collateralToken: { address: string; symbol?: string } | undefined
  expectedBorrowed: ReturnType<typeof useRepayForm>['expectedBorrowed']
  values: RepayFormValues
  isInfoOpen: boolean
  collateralDelta?: Decimal
}) => {
  const repayAmount = expectedBorrowed.data?.totalBorrowed ?? values.userBorrowed ?? values.userCollateral
  const debtDelta = repayAmount ? (`-${repayAmount}` as Decimal) : undefined
  const enabled = isInfoOpen && !!params.marketId

  const prevLoanToValue = useLoanToValueFromUserState({
    ...params,
    collateralToken,
    borrowToken,
    enabled,
  })
  const loanToValue = useLoanToValueFromUserState({
    ...params,
    collateralToken,
    borrowToken,
    enabled,
    debtDelta,
    collateralDelta,
  })

  const userHealth = useUserHealth(
    { chainId: params.chainId, marketId: params.marketId, userAddress: params.userAddress },
    enabled,
  )
  const prevHealth = useMemo(
    () => ({
      data: userHealth.data?.health,
      isLoading: userHealth.isLoading,
      error: userHealth.error,
    }),
    [userHealth.data?.health, userHealth.error, userHealth.isLoading],
  )

  const userState = useUserState(
    { chainId: params.chainId, marketId: params.marketId, userAddress: params.userAddress },
    enabled,
  )

  const futureDebt = useMemo<Decimal | undefined>(() => {
    if (!userState.data?.debt || repayAmount == null) return undefined
    const debt = new BigNumber(userState.data.debt).minus(repayAmount)
    return (debt.isNegative() ? new BigNumber(0) : debt).toString() as Decimal
  }, [repayAmount, userState.data?.debt])

  const debt = useMemo(
    () => ({
      data: futureDebt,
      isLoading: userState.isLoading || expectedBorrowed.isLoading,
      error: userState.error ?? expectedBorrowed.error,
    }),
    [expectedBorrowed.error, expectedBorrowed.isLoading, futureDebt, userState.error, userState.isLoading],
  )

  const prevDebt = useMemo(
    () => ({
      data: userState.data?.debt,
      isLoading: userState.isLoading,
      error: userState.error,
    }),
    [userState.data?.debt, userState.error, userState.isLoading],
  )

  const rates = useMarketRates(params, enabled)
  const futureRates = useMarketFutureRates(
    {
      chainId: params.chainId,
      marketId: params.marketId ?? '',
      debt: (futureDebt ?? userState.data?.debt ?? '0') as Decimal,
    },
    enabled && !!(futureDebt ?? userState.data?.debt) && !!params.marketId,
  )

  return { repayAmount, loanToValue, prevLoanToValue, prevHealth, debt, prevDebt, rates, futureRates }
}

export const RepayFromWallet = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onRepaid,
  leverageEnabled,
}: RepayFormProps<ChainId>) => {
  const network = networks[chainId]
  const [isOpen, , , toggle] = useSwitch(false)
  const [withdrawChecked, enableWithdraw, disableWithdraw] = useSwitch(false)

  const {
    form,
    isPending,
    onSubmit,
    action,
    bands,
    health,
    prices,
    gas,
    isAvailable,
    isFull,
    formErrors,
    collateralToken,
    borrowToken,
    params,
    values,
    expectedBorrowed,
    txHash,
  } = useRepayForm({
    market,
    network,
    networks,
    enabled,
    onRepaid,
    leverageEnabled,
  })

  useEffect(() => {
    form.setValue('userCollateral', '0', setValueOptions)
  }, [form])

  useEffect(() => {
    if (!withdrawChecked) {
      form.setValue('stateCollateral', '0', setValueOptions)
    }
  }, [form, withdrawChecked])

  const collateralDelta =
    withdrawChecked && values.stateCollateral ? (`-${values.stateCollateral}` as Decimal) : undefined

  const info = useRepayInfo({
    params,
    collateralToken,
    expectedBorrowed,
    values,
    isInfoOpen: isOpen,
    collateralDelta,
  })

  const hasRepayAmount = useMemo(
    () =>
      new BigNumber(values.stateCollateral ?? 0)
        .plus(values.userCollateral ?? 0)
        .plus(values.userBorrowed ?? 0)
        .gt(0),
    [values.stateCollateral, values.userBorrowed, values.userCollateral],
  )

  const isDisabled = formErrors.length > 0 || isAvailable.data === false || !hasRepayAmount

  return (
    <LoanFormWrapper // todo: prevHealth, prevRates, debt, prevDebt
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <LoanInfoAccordion
          isOpen={isOpen}
          toggle={toggle}
          health={health}
          prevHealth={info.prevHealth}
          bands={bands}
          prices={prices}
          prevRates={info.rates}
          rates={info.futureRates}
          loanToValue={info.loanToValue}
          prevLoanToValue={info.prevLoanToValue}
          gas={gas}
          debt={info.debt}
          prevDebt={info.prevDebt}
          debtTokenSymbol={borrowToken?.symbol}
        />
      }
    >
      <Stack divider={withdrawChecked ? <InputDivider /> : undefined}>
        <LoanFormTokenInput
          label={t`Repay amount`}
          token={borrowToken}
          blockchainId={network.id}
          name="userBorrowed"
          form={form}
          testId="repay-wallet-borrowed-input"
          network={network}
        />
        {withdrawChecked && (
          <LoanFormTokenInput
            label={t`Amount to withdraw`}
            token={collateralToken}
            blockchainId={network.id}
            name="stateCollateral"
            form={form}
            testId="repay-wallet-withdraw-input"
            network={network}
          />
        )}
      </Stack>

      <FormControlLabel
        control={
          <Checkbox
            checked={withdrawChecked}
            onChange={(e) => (e.target.checked ? enableWithdraw() : disableWithdraw())}
          />
        }
        label={t`Repay & Withdraw`}
      />

      <Button type="submit" loading={isPending || !market} disabled={isDisabled} data-testid="repay-submit-button">
        {isPending ? t`Processing...` : isFull.data ? t`Repay full` : t`Repay`}
      </Button>

      <LoanFormAlerts
        isSuccess={action.isSuccess}
        error={action.error}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['stateCollateral', 'userBorrowed']}
        successTitle={t`Loan repaid`}
      />
    </LoanFormWrapper>
  )
}

export const RepayFromCollateral = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onRepaid,
  leverageEnabled,
}: RepayFormProps<ChainId>) => {
  const network = networks[chainId]
  const [isOpen, , , toggle] = useSwitch(false)
  const [useWalletCollateral, enableWalletCollateral, disableWalletCollateral] = useSwitch(!leverageEnabled)

  const {
    form,
    isPending,
    onSubmit,
    action,
    bands,
    healthFull,
    prices,
    gas,
    isAvailable,
    isFull,
    formErrors,
    collateralToken,
    borrowToken,
    params,
    values,
    expectedBorrowed,
    txHash,
  } = useRepayForm({
    market,
    network,
    networks,
    enabled,
    onRepaid,
    leverageEnabled,
  })

  useEffect(() => {
    if (!useWalletCollateral) {
      form.setValue('userCollateral', '0', setValueOptions)
    }
    form.setValue('userBorrowed', '0', setValueOptions)
  }, [form, useWalletCollateral])

  const collateralDelta =
    values.stateCollateral && values.stateCollateral !== '0' ? (`-${values.stateCollateral}` as Decimal) : undefined

  const info = useRepayInfo({
    params,
    collateralToken,
    expectedBorrowed,
    values,
    isInfoOpen: isOpen,
    collateralDelta,
  })

  const hasRepayAmount = useMemo(
    () =>
      new BigNumber(values.stateCollateral ?? 0)
        .plus(values.userCollateral ?? 0)
        .plus(values.userBorrowed ?? 0)
        .gt(0),
    [values.stateCollateral, values.userBorrowed, values.userCollateral],
  )

  const isDisabled = formErrors.length > 0 || isAvailable.data === false || !hasRepayAmount

  return (
    <LoanFormWrapper
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <LoanInfoAccordion
          isOpen={isOpen}
          toggle={toggle}
          health={healthFull}
          prevHealth={info.prevHealth}
          bands={bands}
          prices={prices}
          prevRates={info.rates}
          rates={info.futureRates}
          loanToValue={info.loanToValue}
          prevLoanToValue={info.prevLoanToValue}
          gas={gas}
          debt={info.debt}
          prevDebt={info.prevDebt}
          debtTokenSymbol={borrowToken?.symbol}
        />
      }
    >
      <Stack divider={useWalletCollateral ? <InputDivider /> : undefined}>
        <LoanFormTokenInput
          label={t`From collateral`}
          token={collateralToken}
          blockchainId={network.id}
          name="stateCollateral"
          form={form}
          testId="repay-collateral-state-input"
          network={network}
        />
        {useWalletCollateral && (
          <LoanFormTokenInput
            label={t`Use wallet collateral`}
            token={collateralToken}
            blockchainId={network.id}
            name="userCollateral"
            form={form}
            testId="repay-collateral-wallet-input"
            network={network}
          />
        )}
      </Stack>

      <FormControlLabel
        control={
          <Checkbox
            checked={useWalletCollateral}
            onChange={(e) => (e.target.checked ? enableWalletCollateral() : disableWalletCollateral())}
          />
        }
        label={t`Add collateral from wallet`}
      />

      <Button type="submit" loading={isPending || !market} disabled={isDisabled} data-testid="repay-submit-button">
        {isPending ? t`Processing...` : isFull.data ? t`Repay full` : t`Repay`}
      </Button>

      <LoanFormAlerts
        isSuccess={action.isSuccess}
        error={action.error}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['stateCollateral', 'userCollateral']}
        successTitle={t`Loan repaid`}
      />
    </LoanFormWrapper>
  )
}
