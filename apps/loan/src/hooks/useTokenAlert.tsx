import { t, Trans } from '@lingui/macro'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import ExternalLink from '@/ui/Link/ExternalLink'
import { AlertType } from '@/types/loan.types'

type TokenAlert = {
  alertType: AlertType
  isInformationOnly?: boolean
  tokenAddress: string
  message: string | React.ReactNode
}

const useTokenAlert = (tokenAddressAll: string[]): TokenAlert | null =>
  useMemo(() => {
    const maAlert: TokenAlert = {
      alertType: 'info',
      isInformationOnly: true,
      tokenAddress: '0x36f8d0d0573ae92326827c4a82fe4ce4c244cab6',
      message: (
        <div>
          <Trans>
            Note: maDAI, maUSDC and maUSDT are LP tokens from the Morpho protocol, a third-party service not affiliated
            with Curve. <StyledExternalLink href="https://vaults.morpho.xyz/">Learn more here</StyledExternalLink>.
          </Trans>
        </div>
      ),
    }

    const alerts: { [tokenAddress: string]: TokenAlert } = {
      '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d': {
        alertType: 'warning',
        tokenAddress: '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
        message: t`The Ren network is currently operational but is expected to go offline in the near future. The exact date is currently unknown. This is out of our control, but we will do everything in our power to make sure the peg of Ren assets is maintained.`,
      },
      '0x36f8d0d0573ae92326827c4a82fe4ce4c244cab6': maAlert,
      '0xa5269a8e31b93ff27b887b56720a25f844db0529': maAlert,
      '0xafe7131a57e44f832cb2de78ade38cad644aac2f': maAlert,
    }

    const tokenAddressWithAlert = (tokenAddressAll ?? []).find((tokenAddress) => !!alerts[tokenAddress])
    return tokenAddressWithAlert ? alerts[tokenAddressWithAlert] : null
  }, [tokenAddressAll])

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  text-transform: initial;
`

export default useTokenAlert
