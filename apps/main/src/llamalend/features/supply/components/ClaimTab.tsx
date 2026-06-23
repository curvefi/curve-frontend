import { useConnection } from 'wagmi'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
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
  marketId: string | undefined
  crvTokenAddress: Address | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
}

const TEST_ID_PREFIX = 'supply-claim'
const { Spacing } = SizesAndSpaces

export const ClaimTab = <ChainId extends IChainId>({
  marketId,
  crvTokenAddress,
  networks,
  chainId,
  enabled,
}: ClaimTabProps<ChainId>) => {
  const { isConnected } = useConnection()
  const network = networks[chainId]

  const {
    params,
    claimableTokens,
    isLoading,
    isError,
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
    marketId,
    crvTokenAddress,
    network,
    enabled,
  })
  return (
    <>
      <FormContent
        footer={<ClaimActionInfoList params={params} networks={networks} isOpen={!!claimableTokens.length} />}
      >
        <DataTable<ClaimableToken>
          table={table}
          emptyState={
            !isError && (
              <Alert severity="info" variant="outlined" data-testid={`${TEST_ID_PREFIX}-empty-state`}>
                <AlertTitle>{t`No rewards to claim`}</AlertTitle>
              </Alert>
            )
          }
          isLoading={isLoading}
          hideHeader
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
            >
              {isRewardsPending ? t`Processing...` : t`Claim other rewards`}
            </Button>
          </Stack>
        ) : (
          <ConnectWalletButton />
        )}

        <FormAlerts error={errors.find(Boolean) ?? null} formErrors={[]} handledErrors={[]} />
      </FormContent>
    </>
  )
}
