import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { Form } from '@ui/features/forms/components/Form'
import { HelperMessage, LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { mapQuery, q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimal, fromWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { BalancerPosition } from '../api/balancer.api'
import { useMigrationForm } from '../hooks/useMigrationForm'
import { type CurveTarget, getBalancerIconTokens } from '../migration.utils'
import { LP_DECIMALS } from '../queries/migration-route.query'
import { CurveTargetFields } from './CurveTargetFields'
import { MigrationActionInfoList } from './MigrationActionInfoList'
import { PoolTokensLabel } from './PoolTokensLabel'

const { Spacing } = SizesAndSpaces

export type MigrationFormProps = {
  chainId: number
  /** Whose Balancer LP is migrated; the page decides, so balances and quotes follow it. */
  userAddress: Address
  blockchainId: string
  position: BalancerPosition
  target: CurveTarget | undefined
}

export const MigrationForm = ({ chainId, userAddress, blockchainId, position, target }: MigrationFormProps) => {
  const {
    form,
    values,
    route,
    priceImpact,
    gas,
    maxAmount,
    lpPriceUsd,
    isApproved,
    onSubmit,
    isPending,
    isDisabled,
    error,
    formErrors,
  } = useMigrationForm({ chainId, userAddress, position, target })
  const amountError = formErrors.find(([field]) => field === 'amount')?.[1]

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <MigrationActionInfoList
          quote={mapQuery(route, ({ amountOut: [amountOut], minAmountOut, routerFeePercentage }) => ({
            amountOut,
            minAmountOut,
            routerFeePercentage,
          }))}
          priceImpact={mapQuery(priceImpact, impact => impact?.priceImpact ?? null)}
          gas={gas}
          slippage={values.slippage}
          onSlippageChange={slippage => form.update({ slippage })}
          userAddress={userAddress}
        />
      }
    >
      <Stack sx={{ gap: Spacing.sm }}>
        <LargeTokenInput
          name="amount"
          label={t`Balancer LP to migrate`}
          testId="balancer-migration-amount"
          balance={q({ data: values.amount, isLoading: false, error: maybe(amountError, Error) ?? null })}
          onBalance={amount => form.update({ amount })}
          walletBalance={{ balance: maxAmount, symbol: position.symbol, usdRate: lpPriceUsd }}
          maxBalance={{ balance: maxAmount, chips: 'range' }}
          inputBalanceUsd={decimal(lpPriceUsd && +(values.amount ?? 0) * lpPriceUsd)}
          tokenSelector={
            <PoolTokensLabel
              protocol="balancer"
              blockchainId={blockchainId}
              tokens={getBalancerIconTokens(position)}
              label={position.name}
            />
          }
        >
          {amountError && (
            <HelperMessage message={amountError} onNumberClick={amount => form.update({ amount })} isError />
          )}
        </LargeTokenInput>

        <CurveTargetFields
          blockchainId={blockchainId}
          target={target}
          expectedLp={mapQuery(route, ({ amountOut: [amountOut] }) => fromWei(amountOut, LP_DECIMALS))}
          stake={values.stake}
          onStakeChange={stake => form.update({ stake })}
        />
      </Stack>

      <EvmFormButton
        pending={isPending}
        disabled={isDisabled}
        label={[isApproved.data === false && t`Approve`, t`Migrate`]}
        testId="balancer-migration-submit"
      />

      <FormAlerts error={error} formErrors={formErrors} handledErrors={['amount']} userAddress={userAddress} />
    </Form>
  )
}
