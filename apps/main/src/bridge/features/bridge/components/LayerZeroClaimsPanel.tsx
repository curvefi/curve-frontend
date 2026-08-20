import { formatUnits } from 'viem'
import { useConfig, useConnection, useSwitchChain } from 'wagmi'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { scanAddressPath, type BaseConfig } from '@ui/utils'
import { useCurrentDate } from '@ui-kit/hooks/useCurrentDate'
import { invalidateTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { createValidationSuite } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { useTransactionMutation } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { AddressCell } from '@ui-kit/shared/ui/DataTable/inline-cells'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { writeContract } from '@wagmi/core'
import { useLayerZeroClaims, type LayerZeroClaim } from '../hooks/useLayerZeroClaims'
import { layerZeroRetryAbi } from '../layerzero'
import { getClaimStatus, type ClaimStatus } from '../layerzero-claims'

const validation = createValidationSuite(() => undefined)

const statusText = (claim: LayerZeroClaim, status: ClaimStatus, now: bigint) => {
  if (status === 'paused') return t`Claim paused`
  if (status === 'waiting-capacity') return t`Waiting for destination capacity`
  if (status === 'ready') return t`Ready to claim`
  const minutes = Math.max(1, Math.ceil(Number(claim.timestamp + claim.wait - now) / 60))
  const hours = Math.floor(minutes / 60)
  return hours ? t`Available in ${hours}h ${minutes % 60}m` : t`Available in ${minutes}m`
}

export const LayerZeroClaimsPanel = ({ networks }: { networks: Record<number, BaseConfig> }) => {
  const config = useConfig()
  const { address, chainId } = useConnection()
  const { switchChain } = useSwitchChain()
  const currentDate = useCurrentDate('1m')
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
      await invalidateTokenBalances(config, {
        chainId: claim.chainId,
        userAddress: claim.receiver,
        tokenAddresses: [claim.tokenAddress],
      })
      await claims.refetch()
    },
    onReset: () => undefined,
    validationSuite: validation,
    validationParams: {},
  })

  if (!address || claims.isLoading || (!claims.claims.length && !claims.failures.length)) return null
  const now = BigInt(Math.floor(currentDate.getTime() / 1000))

  return (
    <Stack spacing={1} data-testid="layerzero-pending-claims">
      {claims.failures.length > 0 && (
        <Alert severity="warning">
          {t`Pending claims could not be checked on ${claims.failures.map(id => networks[id]?.name ?? id).join(', ')}.`}
        </Alert>
      )}
      {claims.claims.length > 0 && (
        <Paper variant="outlined">
          <CardHeader title={t`Outstanding LZ bridge transactions`} size="small" />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t`Amount`}</TableCell>
                  <TableCell>{t`From`}</TableCell>
                  <TableCell>{t`To`}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.claims.map(claim => {
                  const status = getClaimStatus({ ...claim, now, isKilled: claim.isKilled, available: claim.available })
                  const destination = networks[claim.chainId]
                  const origin = networks[claim.originChainId]
                  const wrongChain = chainId !== claim.chainId
                  return (
                    <TableRow key={`${claim.chainId}-${claim.bridgeAddress}-${claim.nonce}`}>
                      <TableCell>
                        <TokenInfo
                          address={claim.tokenAddress}
                          blockchainId={destination.id}
                          iconPosition="left"
                          primary={formatUnits(claim.amount, 18)}
                          secondary={claim.token}
                        />
                      </TableCell>
                      <TableCell>
                        <AddressCell
                          address={claim.bridgeAddress}
                          label={origin.name}
                          explorerUrl={scanAddressPath(origin, claim.bridgeAddress)}
                        />
                      </TableCell>
                      <TableCell>
                        <AddressCell
                          address={claim.bridgeAddress}
                          label={destination.name}
                          explorerUrl={scanAddressPath(destination, claim.bridgeAddress)}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5} sx={{ alignItems: 'stretch' }}>
                          <Typography variant="bodyXsRegular" color="textSecondary">
                            {statusText(claim, status, now)}
                          </Typography>
                          {wrongChain ? (
                            <Button type="button" size="small" onClick={() => switchChain({ chainId: claim.chainId })}>
                              {t`Switch to ${destination.name}`}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="small"
                              disabled={status !== 'ready' || retry.isPending}
                              loading={retry.isPending}
                              onClick={() => retry.mutate(claim)}
                            >
                              {t`Retry`}
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      {retry.error && <Alert severity="error">{retry.error.message}</Alert>}
    </Stack>
  )
}
