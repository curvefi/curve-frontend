import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { TotalNotionalRow } from '@ui-kit/shared/ui/DataTable/inline-cells/notional-cells'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'
import { useClaimTab } from '../hooks/useClaimTab'
import { ClaimInfoAccordion } from './ClaimInfoAccordion'
import { type ClaimableToken } from './columns'

export type ClaimTabProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
}

const TEST_ID_PREFIX = 'supply-claim'

export const ClaimTab = <ChainId extends IChainId>({ market, networks, chainId, enabled }: ClaimTabProps<ChainId>) => {
  const network = networks[chainId]

  const {
    params,
    isPending,
    isDisabled,
    isLoading,
    isError,
    isClaimed,
    claimableTokens,
    totalNotionals,
    usdRateLoading: isNotionalLoading,
    table,
    txHash,
    claimError,
    claimablesError,
    usdRateError,
    onSubmit,
  } = useClaimTab({
    market,
    network,
    enabled,
  })
  return (
    <>
      <FormContent footer={<ClaimInfoAccordion params={params} networks={networks} />}>
        <DataTable<ClaimableToken>
          table={table}
          emptyState={
            !isError && (
              <Alert severity="warning">
                <AlertTitle>{t`No rewards`}</AlertTitle>
                {t`There are currently no rewards to claim. Only markets with active gauge have rewards.`}
              </Alert>
            )
          }
          loading={isLoading}
          hideHeader
          footerRow={
            claimableTokens.length > 1 &&
            !isLoading && (
              <TotalNotionalRow
                sx={{ backgroundColor: (t) => t.design.Table.Row.Hover }}
                totalNotionals={totalNotionals}
                isNotionalLoading={isNotionalLoading}
              />
            )
          }
        />
        <Button
          type="submit"
          loading={isPending || !market}
          disabled={isDisabled}
          data-testid={`${TEST_ID_PREFIX}-submit-button`}
          onClick={onSubmit}
        >
          {isPending ? t`Processing...` : t`Claim`}
        </Button>

        <FormAlerts
          isSuccess={isClaimed}
          error={claimablesError ?? claimError ?? usdRateError}
          txHash={txHash}
          formErrors={[]}
          network={network}
          handledErrors={[]}
          successTitle={t`Claimed successfully`}
        />
      </FormContent>
    </>
  )
}
