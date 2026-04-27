import type { FieldValues } from 'react-hook-form'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import type { LoanFormTokenInputProps } from './LoanFormTokenInput'

type LoanTokenLabelProps = Pick<LoanFormTokenInputProps<FieldValues, never, never>, 'token' | 'blockchainId'>

export const LoanTokenLabel = ({
  blockchainId,
  token,
  badgeAddress,
}: LoanTokenLabelProps & { badgeAddress?: string | null }) => (
  <TokenLabel
    badgeAddress={badgeAddress}
    blockchainId={blockchainId}
    tooltip={token?.symbol}
    address={token?.address ?? null}
    label={token?.symbol ?? '?'}
  />
)
