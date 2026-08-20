import { formatUnits } from 'viem'
import { useConfig, useConnection, useSwitchChain } from 'wagmi'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { BaseConfig } from '@ui/utils'
import { invalidateTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { createValidationSuite } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { useTransactionMutation } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { writeContract } from '@wagmi/core'
import { useLayerZeroClaims, type LayerZeroClaim } from '../hooks/useLayerZeroClaims'
import { LAYERZERO_CLAIM_DEPLOYMENTS, layerZeroRetryAbi } from '../layerzero'

const validation = createValidationSuite(() => undefined)

const statusText = (claim: LayerZeroClaim) => {
  if (claim.status === 'paused') return t`Claim paused`
  if (claim.status === 'waiting-capacity') return t`Waiting for destination capacity`
  if (claim.status === 'ready') return t`Ready to claim`
  const seconds = claim.timestamp + claim.wait - BigInt(Math.floor(Date.now() / 1000))
  return t`Available in ${Math.max(0, Number(seconds / 60n))} minutes`
}

export const LayerZeroClaimsPanel = ({ networks }: { networks: Record<number, BaseConfig> }) => {
  const config = useConfig()
  const { address, chainId } = useConnection()
  const { switchChain } = useSwitchChain()
  const claims = useLayerZeroClaims(address)
  const retry = useTransactionMutation<LayerZeroClaim>({
    mutationKey: ['bridge', 'layerzero-retry'] as const,
    mutationFn: async claim => ({
      hash: await writeContract(config, {
        chainId: claim.chainId,
        address: claim.bridgeAddress,
        abi: layerZeroRetryAbi,
        functionName: 'retry',
        args: [claim.nonce, claim.timestamp, claim.receiver, claim.amount],
      }),
    }),
    pendingMessage: claim => t`Retrying ${claim.token} claim...`,
    successMessage: claim => t`Claimed available ${claim.token}`,
    onSuccess: async (_data, _receipt, claim) => {
      const deployment = LAYERZERO_CLAIM_DEPLOYMENTS.find(
        item =>
          item.chainId === claim.chainId && item.bridgeAddress.toLowerCase() === claim.bridgeAddress.toLowerCase(),
      )
      if (deployment) {
        await invalidateTokenBalances(config, {
          chainId: claim.chainId,
          userAddress: claim.receiver,
          tokenAddresses: [deployment.tokenAddress],
        })
      }
      await claims.refetch()
    },
    onReset: () => undefined,
    validationSuite: validation,
    validationParams: {},
  })
  if (!address || claims.isLoading) return null
  const failed = claims.data?.scans.filter(scan => scan.error) ?? []
  const pending = claims.data?.claims ?? []
  if (!pending.length && !failed.length) return null

  return (
    <Paper variant="outlined" sx={{ p: 2 }} data-testid="layerzero-pending-claims">
      <Stack spacing={2}>
        <Typography variant="bodyMBold">{t`Pending claims (${pending.length})`}</Typography>
        {failed.length > 0 && (
          <Alert severity="warning">
            {t`Pending claims could not be checked on ${failed.map(({ chainId }) => networks[chainId]?.name ?? chainId).join(', ')}.`}
          </Alert>
        )}
        {pending.map(claim => {
          const origin = LAYERZERO_CLAIM_DEPLOYMENTS.find(
            deployment =>
              deployment.chainId === claim.chainId &&
              deployment.bridgeAddress.toLowerCase() === claim.bridgeAddress.toLowerCase(),
          )?.originChainId
          const wrongChain = chainId !== claim.chainId
          return (
            <Stack key={`${claim.chainId}-${claim.bridgeAddress}-${claim.nonce}`} spacing={1}>
              <Typography>
                {formatUnits(claim.amount, 18)} {claim.token} · {networks[origin ?? 0]?.name ?? origin} →{' '}
                {networks[claim.chainId]?.name ?? claim.chainId}
              </Typography>
              <Typography color="textSecondary">{statusText(claim)}</Typography>
              {wrongChain ? (
                <Button type="button" size="small" onClick={() => switchChain({ chainId: claim.chainId })}>
                  {t`Switch to ${networks[claim.chainId]?.name ?? claim.chainId}`}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="small"
                  disabled={claim.status !== 'ready' || retry.isPending}
                  loading={retry.isPending}
                  onClick={() => retry.mutate(claim)}
                >
                  {t`Retry claim`}
                </Button>
              )}
            </Stack>
          )
        })}
        {retry.error && <Alert severity="error">{retry.error.message}</Alert>}
      </Stack>
    </Paper>
  )
}
