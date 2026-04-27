import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LoanTokenLabel } from '@/llamalend/widgets/action-card/LoanTokenLabel'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useUnstakeForm } from '../hooks/useUnstakeForm'
import { AlertUnstakeOnly } from './alerts/AlertUnstakeOnly'
import { UnstakeSupplyInfoList } from './UnstakeSupplyInfoList'

type UnstakeFormProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
}

const TEST_ID_PREFIX = 'supply-unstake'

export const UnstakeForm = <ChainId extends IChainId>({
  market,
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
    vaultToken,
    borrowToken,
    collateralToken,
    unstakeError,
    formErrors,
    max,
  } = useUnstakeForm({ market, network, enabled })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<UnstakeSupplyInfoList form={form} params={params} networks={networks} tokens={{ borrowToken }} />}
    >
      <LoanFormTokenInput
        label={t`Amount to unstake`}
        token={vaultToken}
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
          <LoanTokenLabel
            blockchainId={blockchainId}
            token={borrowToken}
            badgeAddress={collateralToken?.address ?? null}
          />
        }
      />
      {Number(max.data) > 0 && <AlertUnstakeOnly />}

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={isDisabled}
        data-testid={`${TEST_ID_PREFIX}-submit-button`}
      >
        {isPending ? t`Processing...` : t`Unstake`}
      </Button>

      <FormAlerts error={unstakeError} formErrors={formErrors} handledErrors={['unstakeAmount']} />
    </Form>
  )
}
