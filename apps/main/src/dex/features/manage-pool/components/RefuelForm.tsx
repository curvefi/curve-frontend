import type { Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import { HelperMessage, LargeTokenInput } from '@evm-ui/shared/ui/LargeTokenInput'
import { decimal } from '@evm-ui/utils'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { useRefuelForm } from '../hooks/useRefuelForm'
import { RefuelFormList } from './RefuelFormList'

const { Spacing } = SizesAndSpaces

export type RefuelFormParams = {
  chainId: number
  blockchainId: Chain
  poolAddress: Address
}

export const RefuelForm = ({ chainId, blockchainId, poolAddress }: RefuelFormParams) => {
  const {
    form,
    values,
    tokenA,
    tokenB,
    poolTvl,
    refuelError,
    formErrors,
    isPending,
    isDisabled,
    userAddress,
    onSubmit,
  } = useRefuelForm({ chainId, blockchainId, poolAddress })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <RefuelFormList values={values} tokenARate={tokenA.usdRate} tokenBRate={tokenB.usdRate} poolTvl={poolTvl} />
      }
    >
      <Stack sx={{ gap: Spacing.sm }}>
        <LargeTokenInput
          name="tokenAAmount"
          balance={q({ data: values.tokenAAmount, isLoading: false, error: maybe(tokenA.amountError, Error) ?? null })}
          onBalance={tokenAAmount => form.update({ tokenAAmount })}
          walletBalance={tokenA}
          inputBalanceUsd={decimal(
            values.tokenAAmount && tokenA.usdRate.data && tokenA.usdRate.data * +values.tokenAAmount,
          )}
          tokenSelector={
            <TokenLabel
              blockchainId={blockchainId}
              address={tokenA.address}
              label={tokenA.symbol ?? '?'}
              tooltip={tokenA.symbol}
            />
          }
        >
          {tokenA.amountError && (
            <HelperMessage
              message={tokenA.amountError}
              onNumberClick={tokenAAmount => form.update({ tokenAAmount })}
              isError
            />
          )}
        </LargeTokenInput>

        <LargeTokenInput
          name="tokenBAmount"
          balance={q({ data: values.tokenBAmount, isLoading: false, error: maybe(tokenB.amountError, Error) ?? null })}
          onBalance={tokenBAmount => form.update({ tokenBAmount })}
          walletBalance={tokenB}
          inputBalanceUsd={decimal(
            values.tokenBAmount && tokenB.usdRate.data && tokenB.usdRate.data * +values.tokenBAmount,
          )}
          tokenSelector={
            <TokenLabel
              blockchainId={blockchainId}
              address={tokenB.address}
              label={tokenB.symbol ?? '?'}
              tooltip={tokenB.symbol}
            />
          }
        >
          {tokenB.amountError && (
            <HelperMessage
              message={tokenB.amountError}
              onNumberClick={tokenBAmount => form.update({ tokenBAmount })}
              isError
            />
          )}
        </LargeTokenInput>
      </Stack>

      <EvmFormButton
        pending={isPending}
        disabled={isDisabled}
        connectWalletTestId="refuel-connect-wallet-button"
        label={t`Refuel`}
        testId="refuel-submit-button"
      />

      <FormAlerts
        error={refuelError}
        formErrors={formErrors}
        handledErrors={['tokenAAmount', 'tokenBAmount']}
        userAddress={userAddress}
      />
    </Form>
  )
}
