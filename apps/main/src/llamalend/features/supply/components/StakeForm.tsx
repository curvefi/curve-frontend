import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LoanTokenLabel } from '@/llamalend/widgets/action-card/LoanTokenLabel'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useStakeForm } from '../hooks/useStakeForm'
import { AlertNoGauge } from './alerts/AlertNoGauge'
import { StakeSupplyInfoList } from './StakeSupplyInfoList'

type StakeFormProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
}

const TEST_ID_PREFIX = 'supply-stake'

export const StakeForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
}: StakeFormProps<ChainId>) => {
  const network = networks[chainId]
  const blockchainId = network.id

  const {
    form,
    params,
    isPending,
    onSubmit,
    isDisabled,
    vaultToken,
    borrowToken,
    collateralToken,
    stakeError,
    formErrors,
    isApproved,
    hasGauge,
    max,
  } = useStakeForm({ market, network, enabled })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<StakeSupplyInfoList form={form} params={params} networks={networks} tokens={{ borrowToken }} />}
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
          <LoanTokenLabel
            blockchainId={blockchainId}
            token={borrowToken}
            badgeAddress={collateralToken?.address ?? null}
          />
        }
      />

      {hasGauge ? (
        <Button
          type="submit"
          loading={isPending || !market}
          disabled={isDisabled}
          data-testid={`${TEST_ID_PREFIX}-submit-button`}
        >
          {isPending ? t`Processing...` : notFalsy(isApproved.data === false && t`Approve`, t`Stake`).join(' & ')}
        </Button>
      ) : (
        <AlertNoGauge />
      )}

      <FormAlerts error={stakeError} formErrors={formErrors} handledErrors={['stakeAmount']} />
    </Form>
  )
}
