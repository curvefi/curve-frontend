import type { ReactNode } from 'react'
import { useConnection } from 'wagmi'
import Button, { type ButtonProps } from '@mui/material/Button'
import type { Falsy } from '@primitives/objects.utils'
import { joinButtonText } from '@primitives/string.utils'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { t } from '@ui-kit/lib/i18n'

type FormButtonLabelPart = string | Exclude<Falsy, ''>

export type FormButtonProps = Pick<ButtonProps, 'disabled' | 'fullWidth' | 'loading' | 'size' | 'sx'> & {
  children?: ReactNode
  connectWalletTestId?: string
  label?: string | FormButtonLabelPart[]
  pending?: boolean
  testId?: string
}

export const FormButton = ({
  children,
  connectWalletTestId,
  disabled,
  fullWidth,
  label,
  loading = false,
  pending = false,
  size,
  sx,
  testId,
}: FormButtonProps) =>
  useConnection().isConnected ? (
    children || (
      <Button
        type="submit"
        disabled={disabled}
        fullWidth={fullWidth}
        loading={loading ?? pending}
        size={size}
        sx={sx}
        data-testid={testId}
      >
        {pending ? t`Processing...` : Array.isArray(label) ? joinButtonText(...label) : label}
      </Button>
    )
  ) : (
    <ConnectWalletButton size={size} fullWidth={fullWidth} sx={sx} testId={connectWalletTestId} />
  )
