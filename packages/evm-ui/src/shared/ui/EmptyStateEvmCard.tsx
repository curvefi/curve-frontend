import { useConnection } from 'wagmi'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { pick } from '@primitives/objects.utils'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'
import { EmptyStateCard, type EmptyStateCardProps } from '@ui/components/EmptyStateCard'

export type EmptyStateEvmCardProps = Omit<EmptyStateCardProps, keyof ConnectionProps>

export const EmptyStateEvmCard = (props: EmptyStateEvmCardProps) => (
  <EmptyStateCard {...props} {...pick(useConnection(), 'isConnecting', 'isConnected')} connect={useWallet().connect} />
)
