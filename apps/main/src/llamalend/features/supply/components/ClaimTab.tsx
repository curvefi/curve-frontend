import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'
import { useClaimTab } from '../hooks/useClaimTab'
import { TotalNotionalRow } from './cells/notional-cells'
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
    isPending,
    isDisabled,
    isLoading,
    isError,
    claimableTokens,
    totalNotionals,
    usdRateLoading: isNotionalLoading,
    table,
    // isClaimed,
    // claimError,
    // txHash,
  } = useClaimTab({
    market,
    network,
    enabled,
  })

  return (
    <FormContent>
      <DataTable<ClaimableToken>
        table={table}
        emptyState={
          <EmptyStateRow table={table}>{isError ? t`Could not load rewards` : t`No claimable rewards`}</EmptyStateRow>
        }
        loading={isLoading}
        showHeader={false}
        footerCell={
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
      >
        {isPending ? t`Processing...` : t`Claim`}
      </Button>

      {/* <LoanFormAlerts
        isSuccess={isClaimed}
        error={claimError}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={[]}
        successTitle={t`Claimed successfully`}
      /> */}
    </FormContent>
  )
}
