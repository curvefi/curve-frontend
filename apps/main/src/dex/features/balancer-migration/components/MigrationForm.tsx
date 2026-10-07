import { noop } from 'lodash'
import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import { TokenList } from '@evm-ui/features/select-token'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { Form } from '@ui/features/forms/components/Form'
import { HelperMessage, LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { mapQuery, q } from '@ui/features/queries/util'
import type { TokenOption } from '@ui/features/select-token/types'
import { TokenSelector } from '@ui/features/select-token/ui/TokenSelector'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { decimal, fromWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { BalancerPosition } from '../api/balancer.api'
import { useMigrationForm } from '../hooks/useMigrationForm'
import { type CurveTarget, getCurveLpPriceUsd } from '../migration.utils'
import { LP_DECIMALS } from '../queries/migration-route.query'
import { MigrationActionInfoList } from './MigrationActionInfoList'

const { Spacing } = SizesAndSpaces

export type MigrationFormProps = {
  chainId: number
  blockchainId: string
  position: BalancerPosition
  targets: CurveTarget[]
}

export const MigrationForm = ({ chainId, blockchainId, position, targets }: MigrationFormProps) => {
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
  } = useMigrationForm({ chainId, position, targets })
  const [isSelectorOpen, openSelector, closeSelector] = useSwitch()

  const targetOptions = targets.map(({ pool }): TokenOption => ({
    address: pool.lpTokenAddress,
    symbol: pool.name,
    chain: blockchainId,
  }))
  const target = targets.find(({ pool }) => pool.lpTokenAddress === values.targetLpToken)?.pool
  const targetLpPriceUsd = maybe(target, getCurveLpPriceUsd)
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
            <TokenLabel
              blockchainId={blockchainId}
              address={position.address}
              label={position.symbol}
              tooltip={position.name}
            />
          }
        >
          {amountError && (
            <HelperMessage message={amountError} onNumberClick={amount => form.update({ amount })} isError />
          )}
        </LargeTokenInput>

        <LargeTokenInput
          name="expectedLp"
          label={t`Curve LP to receive`}
          testId="balancer-migration-target"
          balance={expectedLp}
          onBalance={noop}
          inputBalanceUsd={decimal(targetLpPriceUsd && expectedLp.data && +expectedLp.data * targetLpPriceUsd)}
          disabled
          tokenSelector={
            <TokenSelector
              title={t`Select a Curve pool`}
              selectedToken={targetOptions.find(({ address }) => address === values.targetLpToken)}
              disabled={!targetOptions.length}
              isOpen={!!isSelectorOpen}
              onOpen={openSelector}
              onClose={closeSelector}
              testId="balancer-migration-target-selector"
              compact
            >
              <TokenList
                tokens={targetOptions}
                onToken={({ address }) => form.update({ targetLpToken: address })}
                disableMyTokens
                disableSorting
              />
            </TokenSelector>
          }
        >
          {!targetOptions.length && <HelperMessage message={t`No Curve pool holds these tokens yet.`} isError />}
        </LargeTokenInput>
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
