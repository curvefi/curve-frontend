import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { Form } from '@ui/features/forms/components/Form'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ArrowsHorizontalIcon } from '@ui/icons/ArrowsHorizontalIcon'
import { t } from '@ui/lib/i18n'
import type { PoolFormProps } from '../pool-form.types'
import { reverseSwap, type SwapFormValues } from './swap-form.utils'
import { SwapTokenInput } from './SwapTokenInput'
export type SwapFormProps = PoolFormProps<SwapFormValues> & {
  inputAmount: QueryProp<Decimal | undefined>
  outputAmount: QueryProp<Decimal | undefined>
}

const { Spacing } = SizesAndSpaces

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
}: SwapFormProps) => (
  <Form {...form} onSubmit={onSubmit} footer={footer}>
    <Stack sx={{ gap: Spacing.xxs }}>
      <SwapTokenInput form={form} tokens={tokens} side="pay" balance={inputAmount} disabled={isPending} />
      <IconButton
        type="button"
        disabled={isPending || !tokens.data}
        onClick={() => form.update(reverseSwap(form.getValues()))}
        data-testid="pool-swap-reverse"
        size="small"
      >
        <ArrowsHorizontalIcon sx={{ rotate: '90deg' }} />
      </IconButton>
      <SwapTokenInput form={form} tokens={tokens} side="receive" balance={outputAmount} disabled={isPending} />
    </Stack>
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
