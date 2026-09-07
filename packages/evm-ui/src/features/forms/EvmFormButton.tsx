import { useConnection } from 'wagmi'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { pick } from '@primitives/objects.utils'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'
import { FormButton, type FormButtonProps } from '@ui/features/forms/FormButton'

export const EvmFormButton = (props: Omit<FormButtonProps, keyof ConnectionProps>) => (
  <FormButton {...props} {...pick(useConnection(), 'isConnecting', 'isConnected')} connect={useWallet().connect} />
)
