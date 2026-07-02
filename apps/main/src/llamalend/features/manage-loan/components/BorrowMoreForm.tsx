import { type ChangeEvent, useCallback } from 'react'
import { LEVERAGE } from '@/llamalend/constants'
import { BorrowMoreLoanInfoList } from '@/llamalend/features/borrow/components/BorrowMoreLoanInfoList'
import { LeverageInput } from '@/llamalend/features/borrow/components/LeverageInput'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q, type QueryProp, type Range } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { shouldBlockTransaction } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'
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
          routes={routes}
          marketType={marketType}
          onSlippageChange={value => updateForm({ slippage: value })}
          leverageEnabled={values.leverageEnabled}
          priceImpact={priceImpact}
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
          max={{ ...max.debt, fieldName: max.debt.field }}
          testId="borrow-more-input-debt"
          network={network}
          hideBalance
          maxMessage={
            <Balance
              inline
              prefix={t`Max borrow amount:`}
              tooltip={t`Max available to borrow`}
              symbol={borrowToken?.symbol}
              balance={max.debt.data}
              loading={max.debt.isLoading}
              onClick={() => updateForm({ debt: max.debt.data })}
            />
          }
        />
      </Stack>
      {isLeverageSupported && (
        <LeverageInput
          checked={values.leverageEnabled}
          leverage={leverage}
          onToggle={onLeverageToggle}
          maxLeverage={max.maxLeverage.data}
        />
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
