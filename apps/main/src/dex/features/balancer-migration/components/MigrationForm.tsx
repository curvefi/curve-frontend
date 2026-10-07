import { noop } from 'lodash'
import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { Form } from '@ui/features/forms/components/Form'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { HelperMessage, LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import type { PoolRow } from '@ui/features/pool-list/types'
import { mapQuery, q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimal, fromWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { BalancerPosition } from '../api/balancer.api'
import { useMigrationForm } from '../hooks/useMigrationForm'
import { type CurveTarget, getBalancerIconTokens, getCurveLpPriceUsd } from '../migration.utils'
import { LP_DECIMALS } from '../queries/migration-route.query'
import { MigrationActionInfoList } from './MigrationActionInfoList'
import { PoolTokensLabel } from './PoolTokensLabel'

const { Spacing } = SizesAndSpaces

export type MigrationFormProps = {
  chainId: number
  blockchainId: string
  position: BalancerPosition
  target: CurveTarget | undefined
  /** Pool-list row of the target, as shown in the Curve pools table. */
  targetRow: PoolRow | undefined
}

export const MigrationForm = ({ chainId, blockchainId, position, target, targetRow }: MigrationFormProps) => {
  const gauge = targetRow?.gauge
  const gaugeAddress = gauge?.isKilled ? undefined : gauge?.address
  const {
    form,
    values,
    params,
    route,
    priceImpact,
    maxAmount,
    lpPriceUsd,
    userAddress,
    isApproved,
    onSubmit,
    isPending,
    isDisabled,
    error,
    formErrors,
  } = useMigrationForm({ chainId, position, target, gaugeAddress })
  const targetLpPriceUsd = maybe(target?.pool, getCurveLpPriceUsd)
  const expectedLp = mapQuery(route, ({ amountOut: [amountOut] }) => fromWei(amountOut, LP_DECIMALS))
  const amountError = formErrors.find(([field]) => field === 'amount')?.[1]

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <MigrationActionInfoList
          form={form}
          params={params}
          route={route}
          priceImpact={priceImpact}
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

        <LargeTokenInput
          name="expectedLp"
          label={values.stake ? t`Staked Curve LP to receive` : t`Curve LP to receive`}
          testId="balancer-migration-target"
          balance={expectedLp}
          onBalance={noop}
          inputBalanceUsd={decimal(targetLpPriceUsd && expectedLp.data && +expectedLp.data * targetLpPriceUsd)}
          disabled
          tokenSelector={
            targetRow && (
              <PoolTokensLabel blockchainId={blockchainId} tokens={targetRow.tradeableCoins} label={targetRow.name} />
            )
          }
        >
          {!target && <HelperMessage message={t`Select a Curve pool to migrate to.`} isError />}
        </LargeTokenInput>
      </Stack>

      <CheckboxField
        checked={values.stake && !!gaugeAddress}
        label={t`Deposit & stake`}
        disabled={!gaugeAddress}
        testIdPrefix="balancer-migration-stake"
        onChange={({ target: { checked } }) => form.update({ stake: checked })}
      />

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
