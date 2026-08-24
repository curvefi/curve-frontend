import { type ChangeEvent, useCallback } from 'react'
import { LEVERAGE } from '@/llamalend/constants'
import { BorrowMoreLoanInfoList } from '@/llamalend/features/borrow/components/BorrowMoreLoanInfoList'
import { LeverageInput } from '@/llamalend/features/borrow/components/LeverageInput'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { getMaxBorrowAmount } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanActionSettings } from '@/llamalend/widgets/action-card/LoanActionSettings'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { FormButton } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { AlertDisableForm } from '@evm-ui/shared/ui/AlertDisableForm'
import { Balance } from '@evm-ui/shared/ui/LargeTokenInput/Balance'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { mapQuery, q, type QueryProp, type Range } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts, HighPriceImpactAlert } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { shouldBlockTransaction } from '@evm-ui/widgets/DetailPageLayout/price-impact.util'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { assert, notFalsy } from '@primitives/objects.utils'
import { useMarketContext } from '../../market-context'
import { useBorrowMoreForm } from '../hooks/useBorrowMoreForm'

const { Spacing } = SizesAndSpaces

export const BorrowMoreForm = <ChainId extends IChainId>({
  networks,
  onPricesUpdated,
  collateralEvents,
}: {
  networks: NetworkDict<ChainId>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
}) => {
  const { chainId, controllerAddress, marketType } = useMarketContext<ChainId>()
  const network = networks[chainId]
  const {
    form,
    values,
    params,
    isPending,
    isLoading,
    onSubmit,
    isDisabled,
    borrowToken,
    collateralToken,
    error,
    isApproved,
    formErrors,
    routes,
    max,
    leverage,
    showUserBorrowed,
    isLeverageSupported,
    exchangeRate,
    priceImpact,
    disabledAlert,
    solvencyModal: { onConfirm, onClose, isOpen },
  } = useBorrowMoreForm({
    networks,
    onPricesUpdated,
    collateralEvents,
  })

  const { update: updateForm } = form

  const onLeverageToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => updateForm({ leverageEnabled: event.target.checked, routeId: undefined }),
    [updateForm],
  )
  const maxDebt = mapQuery(max.debt, ({ maxDebt }) => maxDebt)
  const onMax = useCallback((): undefined => {
    const { maxDebt: maxDebt, router } = assert(max.debt.data, 'expected max debt data')
    if (router) routes?.onChange(router)
    updateForm({ maxDebt: getMaxBorrowAmount(maxDebt, values.leverageEnabled) })
  }, [max.debt.data, routes, updateForm, values.leverageEnabled])

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <BorrowMoreLoanInfoList
          controllerAddress={controllerAddress}
          form={form}
          params={params}
          values={values}
          tokens={{ collateralToken, borrowToken }}
          networks={networks}
          marketType={marketType}
          leverageEnabled={values.leverageEnabled}
        />
      }
    >
      <Stack sx={{ gap: Spacing.xs }}>
        <LoanFormTokenInput
          label={t`Collateral to add`}
          token={collateralToken}
          blockchainId={network.id}
          name="userCollateral"
          form={form}
          max={{ ...q(max.userCollateral), fieldName: max.userCollateral.field }}
          testId="borrow-more-input-collateral"
          network={network}
        />
        {showUserBorrowed && (
          <LoanFormTokenInput
            label={t`Add borrowed from wallet`}
            token={borrowToken}
            blockchainId={network.id}
            name="userBorrowed"
            form={form}
            max={{ ...q(max.userBorrowed), fieldName: max.userBorrowed.field }}
            testId="borrow-more-input-user-borrowed"
            network={network}
          />
        )}

        <LoanFormTokenInput
          label={t`Amount to borrow`}
          token={borrowToken}
          blockchainId={network.id}
          name="debt"
          form={form}
          max={{ ...maxDebt, fieldName: max.debt.field, onMax }}
          testId="borrow-more-input-debt"
          network={network}
          hideBalance
          maxMessage={
            <Balance
              inline
              prefix={t`Max borrow amount:`}
              tooltip={t`Max available to borrow`}
              symbol={borrowToken?.symbol}
              balance={maxDebt}
              onClick={onMax}
            />
          }
        />
      </Stack>
      {isLeverageSupported && (
        <Stack>
          <LeverageInput
            checked={values.leverageEnabled}
            leverage={leverage}
            onToggle={onLeverageToggle}
            maxLeverage={max.maxLeverage.data}
          />
          <LoanActionSettings
            show={values.leverageEnabled === true}
            slippage={values.slippage}
            onSlippageChange={slippage => updateForm({ slippage })}
            routes={routes}
            exchangeRate={exchangeRate}
            priceImpact={priceImpact}
            collateralSymbol={collateralToken?.symbol}
            borrowSymbol={borrowToken?.symbol}
          />
        </Stack>
      )}
      <HighPriceImpactAlert
        priceImpact={priceImpact}
        values={values}
        max={q(max.maxLeverage)}
        slippageType={LEVERAGE}
      />
      <FormButton
        pending={isPending}
        loading={isLoading}
        disabled={isDisabled || shouldBlockTransaction(priceImpact, params)}
        label={[Number(values.userCollateral) && t`Add`, isApproved?.data === false && t`Approve`, t`Borrow More`]}
        testId="borrow-more-submit-button"
      >
        {disabledAlert && <AlertDisableForm>{disabledAlert.message}</AlertDisableForm>}
      </FormButton>
      <LowSolvencyActionModal
        action="borrow"
        open={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        tokenSymbol={collateralToken?.symbol}
      />
      <FormAlerts
        error={error}
        formErrors={formErrors}
        handledErrors={notFalsy(
          'userCollateral',
          max.userCollateral.field,
          showUserBorrowed && 'userBorrowed',
          showUserBorrowed && max.userBorrowed.field,
          'debt',
          max.debt.field,
        )}
      />
    </Form>
  )
}
