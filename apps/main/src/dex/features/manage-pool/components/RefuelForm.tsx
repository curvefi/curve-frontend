import type { Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { HelperMessage, LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useRefuelForm } from '../hooks/useRefuelForm'
import { RefuelFormList } from './RefuelFormList'

const { Spacing } = SizesAndSpaces

export type RefuelFormParams = {
  chainId: number
  blockchainId: Chain
  poolAddress: Address
}

export const RefuelForm = ({ chainId, blockchainId, poolAddress }: RefuelFormParams) => {
  const { form, values, tokenA, tokenB, poolTvl, refuelError, formErrors, isPending, isDisabled, onSubmit } =
    useRefuelForm({
      chainId,
      blockchainId,
      poolAddress,
    })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<RefuelFormList values={values} tokenA={tokenA.usdRate} tokenB={tokenB.usdRate} poolTvl={poolTvl} />}
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

      <FormButton
        pending={isPending}
        disabled={isDisabled}
        connectWalletTestId="refuel-connect-wallet-button"
        label={t`Refuel`}
        testId="refuel-submit-button"
      />

      <FormAlerts error={refuelError} formErrors={formErrors} handledErrors={['tokenAAmount', 'tokenBAmount']} />
    </Form>
  )
}
