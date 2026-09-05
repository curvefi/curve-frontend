import { useConnection } from 'wagmi'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { ConnectEvmWalletButton } from '@evm-ui/features/connect-wallet/ui/ConnectEvmWalletButton'
import { BUTTON_FORM_SIZE } from '@evm-ui/features/forms/constants'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { FormContent } from '@evm-ui/widgets/DetailPageLayout/FormContent'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { useMarketContext } from '../../market-context'
import { useClaimTab } from '../hooks/useClaimTab'
import { ClaimActionInfoList } from './ClaimActionInfoList'
import { TotalNotionalRow } from './columns/notional-cells'

type ClaimTabProps<ChainId extends IChainId> = {
  networks: NetworkDict<ChainId>
}

const TEST_ID_PREFIX = 'supply-claim'
const { Spacing } = SizesAndSpaces

export const ClaimTab = <ChainId extends IChainId>({ networks }: ClaimTabProps<ChainId>) => {
  const { chainId, marketId } = useMarketContext<ChainId>()
  const { isConnected } = useConnection()
  const network = networks[chainId]

  const {
    params,
    claimableTokens,
    isLoading,
    isCrvDisabled,
    isRewardsDisabled,
    isCrvPending,
    isRewardsPending,
    userAddress,
    totalNotionals,
    usdRateLoading: isNotionalLoading,
    table,
    onSubmitCrv,
    onSubmitRewards,
    errors,
  } = useClaimTab({ network })
  return (
    <>
      <FormContent footer={<ClaimActionInfoList params={params} isOpen={!!claimableTokens.length} />}>
        <DataTable
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
        {isConnected ? (
          <Stack sx={{ flexDirection: 'column', gap: Spacing.xs }}>
            <Button
              fullWidth
              type="button"
              loading={isCrvPending || !marketId}
              disabled={isCrvDisabled}
              data-testid={`${TEST_ID_PREFIX}-crv-rewards-submit-button`}
              onClick={onSubmitCrv}
              size={BUTTON_FORM_SIZE}
            >
              {isCrvPending ? t`Processing...` : t`Claim CRV rewards`}
            </Button>
            <Button
              color="secondary"
              fullWidth
              type="button"
              loading={isRewardsPending || !marketId}
              disabled={isRewardsDisabled}
              data-testid={`${TEST_ID_PREFIX}-other-rewards-submit-button`}
              onClick={onSubmitRewards}
              size={BUTTON_FORM_SIZE}
            >
              {isRewardsPending ? t`Processing...` : t`Claim other rewards`}
            </Button>
          </Stack>
        ) : (
          <ConnectEvmWalletButton />
        )}

        <FormAlerts error={errors.find(Boolean) ?? null} formErrors={[]} handledErrors={[]} userAddress={userAddress} />
      </FormContent>
    </>
  )
}
