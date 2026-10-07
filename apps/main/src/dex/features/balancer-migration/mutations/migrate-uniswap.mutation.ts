import { useCallback } from 'react'
import { erc721Abi } from 'viem'
import { useConfig } from 'wagmi'
import { useEvmMutation } from '@evm-ui/queries/useEvmMutation'
import { waitForApproval } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui/lib/i18n'
import { sendTransaction, writeContract } from '@wagmi/core'
import { fetchIsPositionApproved, type UniswapPosition } from '../api/uniswap.api'
import { clmmMigrationValidationSuite, fetchClmmMigrationQuery } from '../queries/clmm-migration.query'
import { invalidateUniswapPositions } from '../queries/uniswap-positions.query'

type MigrateUniswapVariables = { tokenOut: Address; slippage: Decimal }

export const useMigrateUniswapMutation = ({
  chainId,
  userAddress,
  position,
  poolName,
  onReset,
}: {
  chainId: number
  userAddress: Address
  position: UniswapPosition
  poolName: string
  onReset: () => void
}) => {
  const config = useConfig()
  const { positionManager, tokenId, liquidity, tokens } = position
  const { mutate, error, isPending } = useEvmMutation<MigrateUniswapVariables>({
    mutationKey: [{ chainId, tokenId, name: 'uniswapMigration' }] as const,
    mutationFn: async ({ tokenOut, slippage }) => {
      // Fresh quote right before signing: the calldata carries Enso's minimum output, which reverts on worse execution.
      const { tx } = await fetchClmmMigrationQuery(
        {
          chainId,
          userAddress,
          positionManager,
          tokenId,
          liquidity,
          tokens: [tokens[0].address, tokens[1].address],
          tokenOut,
          slippage,
        },
        { staleTime: 0 },
      )
      await waitForApproval({
        isApproved: () =>
          fetchIsPositionApproved(config, { chainId, owner: userAddress, positionManager, tokenId, spender: tx.to }),
        onApprove: async () => [
          await writeContract(config, {
            chainId,
            address: positionManager,
            abi: erc721Abi,
            functionName: 'approve',
            args: [tx.to, BigInt(tokenId)],
          }),
        ],
        message: t`Approved Uniswap position for migration`,
        config,
      })
      return { hash: await sendTransaction(config, { chainId, to: tx.to, data: tx.data, value: BigInt(tx.value) }) }
    },
    validationSuite: clmmMigrationValidationSuite,
    validationParams: { chainId, positionManager, tokenId },
    pendingMessage: () => t`Migrating Uniswap ${poolName} to Curve...`,
    successMessage: () => t`Migrated Uniswap ${poolName} to Curve`,
    onReset: () => {
      void invalidateUniswapPositions({ chainId, userAddress })
      onReset()
    },
  })

  const onSubmit = useCallback(
    ({ tokenOut, slippage }: { tokenOut?: Address; slippage: Decimal }) => mutate({ tokenOut: tokenOut!, slippage }),
    [mutate],
  )
  return { onSubmit, error, isPending }
}
