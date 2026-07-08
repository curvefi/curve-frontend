import type { ReactNode } from 'react'
import { useConnection } from 'wagmi'
import Button, { type ButtonProps } from '@mui/material/Button'
import type { Falsy } from '@primitives/objects.utils'
import { joinButtonText } from '@primitives/string.utils'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { t } from '@ui-kit/lib/i18n'
import { applySxProps } from '@ui-kit/utils'
import { useIsMobileFormDrawer } from '@ui-kit/widgets/DetailPageLayout/form-context/FormPlacementContext'

type FormButtonLabelPart = string | Exclude<Falsy, ''>

export type FormButtonProps = Pick<ButtonProps, 'disabled' | 'fullWidth' | 'loading' | 'size' | 'sx'> & {
  children?: ReactNode
  connectWalletTestId?: string
  label?: string | FormButtonLabelPart[]
  pending?: boolean
  testId?: string
}

const fixedBottomSx = { position: 'fixed', bottom: 0, left: 0, right: 0 } as const

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
}: FormButtonProps) => {
  const isMobileDrawer = useIsMobileFormDrawer()

  return useConnection().isConnected ? (
    children || (
      <Button
        type="submit"
        disabled={disabled}
        fullWidth={isMobileDrawer || fullWidth}
        loading={loading ?? pending}
        size={size}
        sx={applySxProps(sx, isMobileDrawer && fixedBottomSx)}
        data-testid={testId}
      >
        {pending ? t`Processing...` : Array.isArray(label) ? joinButtonText(...label) : label}
      </Button>
    )
  ) : (
    <ConnectWalletButton
      size={size}
      fullWidth={isMobileDrawer || fullWidth}
      sx={applySxProps(sx, isMobileDrawer && fixedBottomSx)}
      testId={connectWalletTestId}
    />
  )
}
