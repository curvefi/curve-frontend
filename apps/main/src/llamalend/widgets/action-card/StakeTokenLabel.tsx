import type { FieldValues } from '@ui-kit/features/forms'
import { Address } from '@primitives/address.utils'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import type { LoanFormTokenInputProps } from './LoanFormTokenInput'

type LoanTokenLabelProps = Pick<LoanFormTokenInputProps<FieldValues, never, never>, 'token' | 'blockchainId'>

export const StakeTokenLabel = ({
  blockchainId,
  vaultTokenLabel,
  collateralTokenAddress,
  borrowTokenAddress,
}: {
  blockchainId: LoanTokenLabelProps['blockchainId']
  vaultTokenLabel: string | undefined
  collateralTokenAddress: Address | null | undefined
  borrowTokenAddress: Address | null | undefined
}) => (
  <TokenLabel
    badgeAddress={collateralTokenAddress}
    blockchainId={blockchainId}
    tooltip={vaultTokenLabel}
    address={borrowTokenAddress}
    label={vaultTokenLabel ?? '?'}
  />
)
