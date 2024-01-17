import type { ButtonProps } from '@/ui/Button/types'

import { t } from '@lingui/macro'
import React from 'react'

import useStore from '@/store/useStore'
import { curveProps } from '@/lib/utils'
import Button from '@/ui/Button'
import Spinner from '@/ui/Spinner'

type Props = {
  curve: CurveApi | null
  loading: boolean
}

const RouterSwapActions = ({ curve, loading, children }: React.PropsWithChildren<Props>) => {
  const { haveSigner } = curveProps(curve)
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)

  const props: Partial<ButtonProps> = {
    fillWidth: true,
    size: 'large',
    variant: 'filled',
  }

  if (!haveSigner) {
    return (
      <Button {...props} testId="swap-connect-wallet" onClick={updateConnectWalletStateKeys}>
        {t`Connect Wallet`}
      </Button>
    )
  } else if (loading) {
    return (
      <Button {...props} testId="swap-loading" disabled variant="icon-filled">
        {t`Loading`} <Spinner isDisabled size={15} />
      </Button>
    )
  }

  return <>{children}</>
}

export default RouterSwapActions
