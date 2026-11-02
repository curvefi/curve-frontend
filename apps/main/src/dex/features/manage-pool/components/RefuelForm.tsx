import type { Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import Stack from '@mui/material/Stack'
import { TokenLabel } from '@ui/components/TokenLabel'
import { Form } from '@ui/features/forms/components/Form'
import { FormTokenInput } from '@ui/features/forms/controls/LargeTokenInput/FormTokenInput'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { useRefuelForm } from '../hooks/useRefuelForm'
import { RefuelFormList } from './RefuelFormList'

const { Spacing } = SizesAndSpaces

export type RefuelFormParams = { chainId: number; blockchainId: Chain; poolAddress: Address }

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
        <FormTokenInput
          form={form}
          name="tokenAAmount"
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
        />

        <FormTokenInput
          form={form}
          name="tokenBAmount"
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
        />
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
