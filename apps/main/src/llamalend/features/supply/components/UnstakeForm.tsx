import type { MarketTokens } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { StakeTokenLabel } from '@/llamalend/widgets/action-card/StakeTokenLabel'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address, Token } from '@primitives/address.utils'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useUnstakeForm } from '../hooks/useUnstakeForm'
import { AlertUnstakeOnly } from './alerts/AlertUnstakeOnly'
import { UnstakeSupplyInfoList } from './UnstakeSupplyInfoList'

type UnstakeFormProps<ChainId extends IChainId> = {
  marketId: string | undefined
  controllerAddress: Address | undefined
  tokens: Partial<MarketTokens>
  vaultToken: Token | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
}

const TEST_ID_PREFIX = 'supply-unstake'

export const UnstakeForm = <ChainId extends IChainId>({
  marketId,
  controllerAddress,
  tokens,
  vaultToken,
  networks,
  chainId,
  enabled,
}: UnstakeFormProps<ChainId>) => {
  const network = networks[chainId]
  const blockchainId = network.id

  const {
    form,
    params,
    isPending,
    onSubmit,
    isDisabled,
    vaultToken: unstakeVaultToken,
    borrowToken,
    collateralToken,
    unstakeError,
    formErrors,
    max,
  } = useUnstakeForm({ marketId, tokens, vaultToken, network, enabled })

  return (
    <Form
      {...form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
      onSubmit={onSubmit}
      footer={
        <UnstakeSupplyInfoList
          form={form}
          params={params}
          networks={networks}
          tokens={{ borrowToken }}
          controllerAddress={controllerAddress}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Amount to unstake`}
        token={unstakeVaultToken}
        blockchainId={blockchainId}
        name="unstakeAmount"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
        positionBalance={{
          position: max,
          tooltip: t`Staked vault shares`,
        }}
        tokenSelector={
          <StakeTokenLabel
            blockchainId={blockchainId}
            vaultTokenLabel={unstakeVaultToken?.symbol}
            collateralTokenAddress={collateralToken?.address}
            borrowTokenAddress={borrowToken?.address}
          />
        }
      />
      {Number(max.data) > 0 && <AlertUnstakeOnly />}

      <FormButton
        pending={isPending}
        loading={!marketId}
        disabled={isDisabled}
        label={t`Unstake`}
        testId={`${TEST_ID_PREFIX}-submit-button`}
      />

      <FormAlerts error={unstakeError} formErrors={formErrors} handledErrors={['unstakeAmount']} />
    </Form>
  )
}
