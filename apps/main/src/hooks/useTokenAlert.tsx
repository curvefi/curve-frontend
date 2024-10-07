import { t, Trans } from '@lingui/macro'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import ExternalLink from '@/ui/Link/ExternalLink'

const useTokenAlert = (tokenAddressAll: string[]): PoolAlert | null => {
  return useMemo(() => {
    const maAlert: PoolAlert = {
      alertType: 'info',
      isInformationOnly: true,
      address: '0x36f8d0d0573ae92326827c4a82fe4ce4c244cab6',
      message: (
        <div>
          <Trans>
            Note: maDAI, maUSDC and maUSDT are LP tokens from the Morpho protocol, a third-party service not affiliated
            with Curve. <StyledExternalLink href="https://vaults.morpho.xyz/">Learn more here</StyledExternalLink>.
          </Trans>
        </div>
      ),
    }

    const alerts: { [tokenAddress: string]: PoolAlert } = {
      '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d': {
        alertType: 'warning',
        address: '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
        message: t`The Ren network is currently operational but is expected to go offline in the near future. The exact date is currently unknown.`,
      },
      '0x36f8d0d0573ae92326827c4a82fe4ce4c244cab6': maAlert,
      '0xa5269a8e31b93ff27b887b56720a25f844db0529': maAlert,
      '0xafe7131a57e44f832cb2de78ade38cad644aac2f': maAlert,
      '0x8daebade922df735c38c80c7ebd708af50815faa': {
        alertType: 'info',
        address: '0x8daebade922df735c38c80c7ebd708af50815faa',
        isInformationOnly: true,
        isCloseOnTooltipOnly: true,
        message: (
          <div>
            <Trans>
              tBTC v1 is in sunset mode: Threshold Network is offering bonds to bring those deprecated v1 out of
              circulation. Lps in this pool can use those LP tokens to acquire our bonds in{' '}
              <StyledExternalLink href="https://app.bondprotocol.finance/#/market/1/115">
                https://app.bondprotocol.finance/#/market/1/115
              </StyledExternalLink>
            </Trans>
          </div>
        ),
      },
    }

    const tokenAddressWithAlert = (tokenAddressAll ?? []).find((tokenAddress) => !!alerts[tokenAddress])
    return tokenAddressWithAlert ? alerts[tokenAddressWithAlert] : null
  }, [tokenAddressAll])
}

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  text-transform: initial;
  word-break: break-word;
`

export default useTokenAlert
