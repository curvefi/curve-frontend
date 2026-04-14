import { type ChangeEvent, useCallback } from 'react'
import { BorrowMoreLoanInfoList } from '@/llamalend/features/borrow/components/BorrowMoreLoanInfoList'
import { LeverageInput } from '@/llamalend/features/borrow/components/LeverageInput'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { isLeverageBorrowMoreSupported } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { joinButtonText } from '@primitives/string.utils'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q, type QueryProp, type Range } from '@ui-kit/types/util'
import { isDevelopment } from '@ui-kit/utils'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useBorrowMoreForm } from '../hooks/useBorrowMoreForm'

const { Spacing } = SizesAndSpaces

export const BorrowMoreForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onPricesUpdated,
  collateralEvents,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled: boolean
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
}) => {
  const network = networks[chainId]
  const {
    form,
    values,
    params,
    isPending,
    onSubmit,
    isDisabled,
    borrowToken,
    collateralToken,
    borrowError,
    isApproved,
    formErrors,
    routes,
    max,
    leverage,
    isLeverageEnabled,
    priceImpact,
  } = useBorrowMoreForm({
    market,
    network,
    enabled,
    onPricesUpdated,
    collateralEvents,
  })

  const fromBorrowed = isLeverageEnabled && isDevelopment // todo: delete this if users do not complain about it, for now dev-only feature

  const onLeverageToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      updateForm(form, { leverageEnabled: event.target.checked, routeId: undefined }),
    [form],
  )

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <BorrowMoreLoanInfoList
          market={market}
          form={form}
          params={params}
          values={values}
          tokens={{ collateralToken, borrowToken }}
          networks={networks}
          routes={routes}
          onSlippageChange={(value) => updateForm(form, { slippage: value })}
          leverageEnabled={values.leverageEnabled}
        />
      }
    >
      <Stack gap={Spacing.xs}>
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
        {fromBorrowed && (
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
          message={`${t`Max borrow amount:`} ${max.debt.data ?? '-'} ${borrowToken?.symbol}`}
        />
      </Stack>

      {isLeverageBorrowMoreSupported(market) && (
        <LeverageInput
          checked={values.leverageEnabled}
          leverage={leverage}
          onToggle={onLeverageToggle}
          maxLeverage={max.maxLeverage.data}
        />
      )}

      <HighPriceImpactAlert priceImpact={priceImpact} values={values} />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={isDisabled}
        data-testid="borrow-more-submit-button"
        data-validation={JSON.stringify({
          hasMarket: !!market,
          isLeverageEnabled,
          isPending,
          isDisabled,
          isValid: form.formState.isValid,
          isSubmitting: form.formState.isSubmitting,
          isApproved: q(isApproved),
          formErrors,
          rawFormErrors: Object.entries(form.formState.errors),
          dirtyFields: form.formState.dirtyFields,
        })}
      >
        {isPending
          ? t`Processing...`
          : joinButtonText(
              Number(values.userCollateral) && t`Add`,
              isApproved?.data === false && t`Approve`,
              t`Borrow More`,
            )}
      </Button>

      <FormAlerts
        error={borrowError}
        formErrors={formErrors}
        handledErrors={notFalsy(
          'userCollateral',
          max.userCollateral.field,
          fromBorrowed && 'userBorrowed',
          fromBorrowed && max.userBorrowed.field,
          'debt',
          max.debt.field,
        )}
      />
    </Form>
  )
}
