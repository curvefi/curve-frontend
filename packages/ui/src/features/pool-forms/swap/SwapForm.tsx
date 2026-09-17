import Button from '@mui/material/Button'
import type { Decimal } from '@primitives/decimal.utils'
import { Form } from '@ui/features/forms/components/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { PoolFormProps } from '../pool-form.types'
import type { SwapFormValues } from './swap-form.utils'
import { SwapTokenInput } from './SwapTokenInput'

export type SwapFormProps = PoolFormProps<SwapFormValues> & {
  inputAmount: QueryProp<Decimal | undefined>
  outputAmount: QueryProp<Decimal | undefined>
}

export const SwapForm = ({
  form,
  tokens,
  inputAmount,
  outputAmount,
  onSubmit,
  isPending,
  isLoading,
  isDisabled,
  wallet,
  userAddress,
  error,
  formErrors,
  footer,
  priceImpact,
}: SwapFormProps) => {
  const { fromIndex, toIndex } = form.watchValues()
  return (
    <Form {...form} onSubmit={onSubmit} footer={footer}>
      <SwapTokenInput form={form} tokens={tokens} side="pay" balance={inputAmount} disabled={isPending} />
      <Button
        type="button"
        disabled={isPending || !tokens.data}
        onClick={() =>
          form.update({
            fromIndex: toIndex,
            toIndex: fromIndex,
            inputAmount: outputAmount.data,
            outputAmount: inputAmount.data,
            editedSide: 'pay',
          })
        }
        data-testid="pool-swap-reverse"
      >
        {t`Reverse tokens`}
      </Button>
      <SwapTokenInput form={form} tokens={tokens} side="receive" balance={outputAmount} disabled={isPending} />
      <HighPriceImpactAlert priceImpact={priceImpact} />
      <FormButton
        {...wallet}
        pending={isPending}
        loading={isLoading}
        disabled={isDisabled}
        label={t`Swap`}
        testId="pool-swap-submit"
        connectWalletTestId="pool-swap-connect-wallet"
      />
      <FormAlerts
        error={error}
        formErrors={formErrors}
        handledErrors={['inputAmount', 'outputAmount']}
        userAddress={userAddress}
      />
    </Form>
  )
}
