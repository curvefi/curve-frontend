import { useConnection } from 'wagmi'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { pick } from '@primitives/objects.utils'
import { EmptyStateCard, type EmptyStateCardProps } from '@ui/components/EmptyStateCard'
import type { ConnectionProps } from '@ui/features/connect-wallet/ConnectWalletButton'

export type EmptyStateEvmCardProps = Omit<EmptyStateCardProps, keyof ConnectionProps>

export const EmptyStateEvmCard = (props: EmptyStateEvmCardProps) => (
  <EmptyStateCard {...props} {...pick(useConnection(), 'isConnecting', 'isConnected')} connect={useWallet().connect} />
)
