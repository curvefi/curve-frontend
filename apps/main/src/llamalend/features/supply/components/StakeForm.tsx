import type { MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import { StakeTokenLabel } from '@/llamalend/widgets/action-card/StakeTokenLabel'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address, Token } from '@primitives/address.utils'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useStakeForm } from '../hooks/useStakeForm'
import { AlertNoGauge } from './alerts/AlertNoGauge'
import { StakeSupplyInfoList } from './StakeSupplyInfoList'

type StakeFormProps<ChainId extends IChainId> = {
  marketId: string | undefined
  controllerAddress: Address | undefined
  tokens: MarketTokensOrEmpty
  vaultToken: Token | undefined
  gaugeAddress: Address | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
}

const TEST_ID_PREFIX = 'supply-stake'

export const StakeForm = <ChainId extends IChainId>({
  marketId,
  controllerAddress,
  tokens,
  vaultToken,
  gaugeAddress,
  networks,
  chainId,
}: StakeFormProps<ChainId>) => {
  const network = networks[chainId]
  const blockchainId = network.id

  const {
    form,
    params,
    isPending,
    isLoading,
    onSubmit,
    isDisabled,
    borrowToken,
    collateralToken,
    error,
    formErrors,
    isApproved,
    hasGauge,
    max,
    disabledAlert,
    solvencyModal: { onConfirm, onClose, isOpen },
  } = useStakeForm({ marketId, controllerAddress, tokens, gaugeAddress, network })

  return (
    <Form
      {...form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
      onSubmit={onSubmit}
      footer={
        <StakeSupplyInfoList
          form={form}
          params={params}
          networks={networks}
          tokens={{ borrowToken }}
          controllerAddress={controllerAddress}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Amount to stake`}
        token={vaultToken}
        blockchainId={blockchainId}
        name="stakeAmount"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
        tokenSelector={
          <StakeTokenLabel
            blockchainId={blockchainId}
            vaultTokenLabel={vaultToken?.symbol}
            collateralTokenAddress={collateralToken?.address}
            borrowTokenAddress={borrowToken?.address}
          />
        }
      />

      <FormButton
        pending={isPending}
        loading={isLoading}
        disabled={isDisabled}
        label={[isApproved.data === false && t`Approve`, t`Stake`]}
        testId={`${TEST_ID_PREFIX}-submit-button`}
      >
        {hasGauge ? disabledAlert && <AlertDisableForm>{disabledAlert.message}</AlertDisableForm> : <AlertNoGauge />}
      </FormButton>

      <LowSolvencyActionModal
        action="stake"
        open={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        tokenSymbol={vaultToken?.symbol}
      />

      <FormAlerts error={error} formErrors={formErrors} handledErrors={['stakeAmount']} />
    </Form>
  )
}
