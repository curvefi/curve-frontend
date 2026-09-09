import { useConnection } from 'wagmi'
import { useWallet } from '@evm-ui/features/connect-wallet'
import type { RowData } from '@tanstack/react-table'
import type { ConnectionProps } from '@ui/features/connect-wallet/ConnectWalletButton'
import { DataTable, type DataTableProps } from '@ui/features/tables/DataTable'

export type EvmDataTableProps<TData extends RowData> = Omit<
  DataTableProps<TData>,
  'userAddress' | keyof ConnectionProps
>

export const EvmDataTable = <TData extends RowData>(props: EvmDataTableProps<TData>) => {
  const { address, isConnecting, isConnected } = useConnection()
  const { connect } = useWallet()
  return (
    <DataTable
      {...props}
      userAddress={address}
      isConnecting={isConnecting}
      isConnected={isConnected}
      connect={connect}
    />
  )
}
