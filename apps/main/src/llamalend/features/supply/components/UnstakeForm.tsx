import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { UnstakeOptions } from '@/llamalend/mutations/unstake.mutation'
import { LoanFormAlerts } from '@/llamalend/widgets/action-card/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { useUnstakeForm } from '../hooks/useUnstakeForm'
import { UnstakeSupplyInfoList } from './UnstakeSupplyInfoList'

export type UnstakeFormProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onUnstaked?: NonNullable<UnstakeOptions['onUnstaked']>
}

const TEST_ID_PREFIX = 'supply-unstake'

export const UnstakeForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onUnstaked,
}: UnstakeFormProps<ChainId>) => {
  const network = networks[chainId]

  const {
    form,
    params,
    isPending,
    onSubmit,
    isDisabled,
    vaultToken,
    borrowToken,
    isUnstaked,
    unstakeError,
    txHash,
    formErrors,
    max,
  } = useUnstakeForm({
    market,
    network,
    enabled,
    onUnstaked,
  })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<UnstakeSupplyInfoList params={params} networks={networks} tokens={{ borrowToken }} />}
    >
      <LoanFormTokenInput
        label={t`Amount to unstake`}
        token={vaultToken}
        blockchainId={network.id}
        name="unstakeAmount"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
        positionBalance={{
          position: max,
          tooltip: t`Staked vault shares`,
        }}
      />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={isDisabled}
        data-testid={`${TEST_ID_PREFIX}-submit-button`}
      >
        {isPending ? t`Processing...` : t`Unstake`}
      </Button>

      <LoanFormAlerts
        isSuccess={isUnstaked}
        error={unstakeError}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['unstakeAmount']}
        successTitle={t`Unstaked successfully`}
      />
    </Form>
  )
}
