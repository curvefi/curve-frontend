import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, maybes } from '@primitives/objects.utils'
import type { FieldPathByValue } from '@ui/features/forms'
import { FormTokenInput } from '@ui/features/forms/controls/LargeTokenInput/FormTokenInput'
import { decimalMultiply } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { getPoolDefaultValues, poolAmountField, poolMaxAmountField, type PoolDepositForm } from '../pool-form.utils'
import { PoolTokenSelector } from '../PoolTokenSelector'
import { DepositForm, type DepositFormProps } from './DepositForm'

export const OneCoinDepositForm = <TValues extends PoolDepositForm>(props: DepositFormProps<TValues>) => {
  const { form, tokens, maxAmounts, inputsDisabled, isPending } = props
  const index = form.values.tokenIndex
  const token = tokens?.[index]
  const field = poolAmountField(index)
  return (
    <DepositForm {...props}>
      <FormTokenInput
        form={form}
        name={field as FieldPathByValue<TValues, Decimal | undefined>}
        max={maxAmounts?.[index]}
        maxField={poolMaxAmountField(index) as FieldPathByValue<TValues, Decimal | undefined>}
        label={t`Deposit`}
        error={token?.error}
        disabled={inputsDisabled !== false}
        inputBalanceUsd={maybes([form.values[field], token?.data?.usdRate], decimalMultiply)}
        walletBalance={token?.data && { symbol: token.data.symbol, balance: token.data.balance }}
        onBalance={value => form.update(fromEntries([[field, value]]))}
        testId={`pool-token-input-${token?.data?.address}`}
        tokenSelector={
          <PoolTokenSelector
            tokens={tokens}
            selectedIndex={index}
            onToken={tokenIndex =>
              form.update({ ...getPoolDefaultValues(tokens?.length ?? 0), isBalanced: false, tokenIndex })
            }
            disabled={isPending}
            label={t`Deposit token`}
            testId="deposit-token-select"
          />
        }
      />
    </DepositForm>
  )
}
