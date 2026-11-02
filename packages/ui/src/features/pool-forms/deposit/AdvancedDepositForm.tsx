import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { isComplete } from '@primitives/array.utils'
import { fromEntries } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { getBalancedAmounts } from '../balanced-amounts.utils'
import { poolAmountField, type PoolDepositForm } from '../pool-form.utils'
import { PoolTokenInputs } from '../PoolTokenInputs'
import { BalancedDepositCheckbox } from './BalancedDepositCheckbox'
import { DepositForm, type DepositFormProps } from './DepositForm'

export const AdvancedDepositForm = <TValues extends PoolDepositForm>(props: DepositFormProps<TValues>) => {
  const { form, tokens, reserves, inputsDisabled, maxAmounts, isPending, isSeed, wallet } = props
  return (
    <DepositForm {...props}>
      {isSeed.data && (
        <Alert severity="info" variant="outlined" data-testid="pool-deposit-seed-alert">
          <AlertTitle>{t`The first deposit must fund every coin`}</AlertTitle>
          {t`The seed lock is permanent; expected LP is the net amount you receive.`}
        </Alert>
      )}
      <PoolTokenInputs
        form={form}
        tokens={tokens}
        disabled={inputsDisabled}
        maxAmounts={maxAmounts}
        onValueChange={(index, value) => {
          const { isBalanced, decimals } = form.getValues()
          form.update(
            isBalanced && isComplete(reserves.data) && isComplete(decimals)
              ? fromEntries(
                  getBalancedAmounts(reserves.data, decimals, value, index).map((amount, i) => [
                    poolAmountField(i),
                    amount,
                  ]),
                )
              : { [poolAmountField(index)]: value },
          )
        }}
      />
      <BalancedDepositCheckbox
        reserves={reserves}
        isConnected={wallet.isConnected}
        disabled={
          isPending || isSeed.data === true || (wallet.isConnected && !maxAmounts?.every(({ data }) => data != null))
        }
      />
    </DepositForm>
  )
}
