import type { Decimal } from '@primitives/decimal.utils'
import { Form } from '@ui/features/forms/components/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import { allTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import { LiquidityProviderInput } from '@ui/features/pool-forms/withdraw/LiquidityProviderInput'
import { type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { PoolFormProps } from '../pool-form.types'
import { PoolTokenInputs } from '../PoolTokenInputs'
import type { WithdrawFormValues } from './withdraw-form.utils'

type WithdrawFormProps = PoolFormProps<WithdrawFormValues> & {
  reserves: QueryProp<Decimal[]>
  maxAmounts: QueryProp<(Decimal | undefined)[]>
  decimals: QueryProp<(number | undefined)[]>
  lpBalance: QueryProp<Decimal>
  supply: QueryProp<Decimal>
  lpTokenDecimals: number
}

export const WithdrawForm = ({
  form,
  tokens,
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
  reserves,
  maxAmounts,
  lpBalance,
  decimals,
  lpTokenDecimals,
  supply,
}: WithdrawFormProps) => (
  <Form {...form} onSubmit={onSubmit} footer={footer}>
    <LiquidityProviderInput
      tokens={tokens}
      reserves={reserves}
      decimals={decimals}
      lpTokenDecimals={lpTokenDecimals}
      supply={supply}
      balance={lpBalance}
      isDisabled={isPending}
    />
    <PoolTokenInputs tokens={tokens} reserves={reserves} isDisabled={isPending} maxAmounts={maxAmounts} hideMaxButton />
    <HighPriceImpactAlert priceImpact={priceImpact} />
    <FormButton
      {...wallet}
      pending={isPending}
      loading={isLoading}
      disabled={isDisabled}
      label={t`Withdraw`}
      testId="pool-withdraw-submit"
      connectWalletTestId="pool-withdraw-connect-wallet"
    />
    <FormAlerts
      error={error}
      formErrors={formErrors}
      handledErrors={['lpAmount', 'maxLpAmount', ...(allTokenFields(tokens.data?.length) ?? [])]}
      userAddress={userAddress}
    />
  </Form>
)
