import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'
import { useClaimTab } from '../hooks/useClaimTab'
import { ClaimActionInfoList } from './ClaimActionInfoList'
import { type ClaimableToken } from './columns'
import { TotalNotionalRow } from './columns/notional-cells'

type ClaimTabProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
}

const TEST_ID_PREFIX = 'supply-claim'
const { Spacing } = SizesAndSpaces

export const ClaimTab = <ChainId extends IChainId>({ market, networks, chainId, enabled }: ClaimTabProps<ChainId>) => {
  const network = networks[chainId]

  const {
    params,
    claimableTokens,
    isLoading,
    isCrvDisabled,
    isRewardsDisabled,
    isCrvPending,
    isRewardsPending,
    totalNotionals,
    usdRateLoading: isNotionalLoading,
    table,
    onSubmitCrv,
    onSubmitRewards,
    errors,
  } = useClaimTab({
    market,
    network,
    enabled,
  })
  return (
    <>
      <FormContent
        footer={<ClaimActionInfoList params={params} networks={networks} isOpen={!!claimableTokens.length} />}
      >
        <DataTable<ClaimableToken>
          category="form"
          table={table}
          emptyState={{ title: t`No rewards to claim`, testId: `${TEST_ID_PREFIX}-empty-state` }}
          footerRow={
            !!claimableTokens.length &&
            !isLoading && (
              <TotalNotionalRow
                sx={{ backgroundColor: t => t.design.Table.Row.Hover }}
                totalNotionals={totalNotionals}
                isNotionalLoading={isNotionalLoading}
              />
            )
          }
        />
        <Stack sx={{ flexDirection: 'column', gap: Spacing.xs }}>
          <Button
            fullWidth
            type="button"
            loading={isCrvPending || !market}
            disabled={isCrvDisabled}
            data-testid={`${TEST_ID_PREFIX}-crv-rewards-submit-button`}
            onClick={onSubmitCrv}
          >
            {isCrvPending ? t`Processing...` : t`Claim CRV rewards`}
          </Button>
          <Button
            color="secondary"
            fullWidth
            type="button"
            loading={isRewardsPending || !market}
            disabled={isRewardsDisabled}
            data-testid={`${TEST_ID_PREFIX}-other-rewards-submit-button`}
            onClick={onSubmitRewards}
          >
            {isRewardsPending ? t`Processing...` : t`Claim other rewards`}
          </Button>
        </Stack>

        <FormAlerts error={errors.find(Boolean) ?? null} formErrors={[]} handledErrors={[]} />
      </FormContent>
    </>
  )
}
