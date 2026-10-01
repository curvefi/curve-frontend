import { useConnection } from 'wagmi'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { ConnectEvmWalletButton } from '@evm-ui/features/connect-wallet/ui/ConnectEvmWalletButton'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import Button from '@mui/material/Button'
import { FormContent } from '@ui/features/forms/components/FormContent'
import { BUTTON_FORM_SIZE } from '@ui/features/forms/constants'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { t } from '@ui/lib/i18n'
import { useMarketContext } from '../../market-context'
import { TotalNotionalRow } from '../../supply/components/columns/notional-cells'
import { useBorrowClaimTab } from '../hooks/useBorrowClaimTab'
import { BorrowClaimActionInfoList } from './BorrowClaimActionInfoList'

type BorrowClaimTabProps<ChainId extends IChainId> = { networks: NetworkDict<ChainId> }

const TEST_ID_PREFIX = 'borrow-claim'

export const BorrowClaimTab = <ChainId extends IChainId>({ networks }: BorrowClaimTabProps<ChainId>) => {
  const { chainId, marketId } = useMarketContext<ChainId>()
  const { isConnected } = useConnection()
  const {
    params,
    userAddress,
    table,
    claimableTokens,
    totalNotionals,
    usdRateLoading,
    isLoading,
    onSubmitCrv,
    isCrvDisabled,
    isCrvPending,
    errors,
  } = useBorrowClaimTab({ network: networks[chainId] })

  return (
    <FormContent footer={<BorrowClaimActionInfoList params={params} isOpen={!!claimableTokens.length} />}>
      <EvmDataTable
        category="form"
        table={table}
        emptyState={{ title: t`No rewards to claim`, testId: `${TEST_ID_PREFIX}-empty-state` }}
        footerRow={
          !!claimableTokens.length &&
          !isLoading && (
            <TotalNotionalRow
              sx={{ backgroundColor: t => t.design.Table.Row.Hover }}
              totalNotionals={totalNotionals}
              isNotionalLoading={usdRateLoading}
            />
          )
        }
      />
      {isConnected ? (
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
      ) : (
        <ConnectEvmWalletButton />
      )}
      <FormAlerts error={errors.find(Boolean) ?? null} formErrors={[]} handledErrors={[]} userAddress={userAddress} />
    </FormContent>
  )
}
