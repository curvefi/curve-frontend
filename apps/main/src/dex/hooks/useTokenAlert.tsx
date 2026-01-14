import { useMemo } from 'react'
import { styled } from 'styled-components'
import { PoolAlert } from '@/dex/types/main.types'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { t, Trans } from '@ui-kit/lib/i18n'

export const useTokenAlert = (tokenAddressAll: string[] | undefined): PoolAlert | null =>
  useMemo(() => {
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
      '0xb01dd87b29d187f3e3a4bf6cdaebfb97f3d9ab98': {
        alertType: 'warning',
        address: '0xb01dd87b29d187f3e3a4bf6cdaebfb97f3d9ab98',
        message: (
          <div>
            <Trans>
              The Liquity BOLD token has been redeployed. This pool contain the legacy BOLD token.{' '}
              <StyledExternalLink href="https://www.liquity.org/blog/liquity-v2-redeployment">
                Learn more here
              </StyledExternalLink>
              .
            </Trans>
          </div>
        ),
      },
      '0x8c0d76c9b18779665475f3e212d9ca1ed6a1a0e6': {
        alertType: 'danger',
        address: '0x8c0d76c9b18779665475f3e212d9ca1ed6a1a0e6',
        message: (
          <div>
            <Trans>
              The Zunami protocol has been hacked — the collateral for zunUSD and zunETH has been stolen.{' '}
              <StyledExternalLink href="https://x.com/ZunamiProtocol/status/1922993510925435267">
                Learn more here
              </StyledExternalLink>
              .
            </Trans>
          </div>
        ),
      },
      '0xc2e660c62f72c2ad35ace6db78a616215e2f2222': {
        alertType: 'danger',
        address: '0xc2e660c62f72c2ad35ace6db78a616215e2f2222',
        message: (
          <div>
            <Trans>
              The Zunami protocol has been hacked — the collateral for zunUSD and zunETH has been stolen.{' '}
              <StyledExternalLink href="https://x.com/ZunamiProtocol/status/1922993510925435267">
                Learn more here
              </StyledExternalLink>
              .
            </Trans>
          </div>
        ),
      },
      '0x06d65ec13465ac5a4376dc101e1141252c4addf8': {
        alertType: 'danger',
        address: '0x06d65ec13465ac5a4376dc101e1141252c4addf8',
        message: (
          <div>
            <Trans>
              The Zunami protocol has been hacked — the collateral for zunUSD and zunETH has been stolen.{' '}
              <StyledExternalLink href="https://x.com/ZunamiProtocol/status/1922993510925435267">
                Learn more here
              </StyledExternalLink>
              .
            </Trans>
          </div>
        ),
      },
      '0x870908873b6f940e025a7c6879678cb82ec6c9b6': {
        alertType: 'danger',
        address: '0x870908873b6f940e025a7c6879678cb82ec6c9b6',
        message: (
          <div>
            <Trans>
              The Zunami protocol has been hacked — the collateral for zunUSD and zunETH has been stolen.{' '}
              <StyledExternalLink href="https://x.com/ZunamiProtocol/status/1922993510925435267">
                Learn more here
              </StyledExternalLink>
              .
            </Trans>
          </div>
        ),
      },
      '0x59d9356e565ab3a36dd77763fc0d87feaf85508c': {
        alertType: 'warning',
        isInformationOnly: true,
        address: '0x59d9356e565ab3a36dd77763fc0d87feaf85508c',
        message: (
          <div>
            <Trans>
              Mountain Protocol is winding down USDM. Minting is disabled since May 12, 2025. Primary customers can
              redeem USDM via Mountain Protocol. Other holders can swap on supported exchanges.{' '}
              <StyledExternalLink href="https://x.com/MountainUSDM/status/1921960086362108270">
                Learn more here
              </StyledExternalLink>
            </Trans>
          </div>
        ),
      },
      '0x97effb790f2fbb701d88f89db4521348a2b77be8': {
        alertType: 'danger',
        address: '0x97effb790f2fbb701d88f89db4521348a2b77be8',
        message: (
          <div>
            <Trans>
              A vulnerability in the CVXRewardDistributor contract was exploited allowing the hacker to mint 58m CVG
              intended for future emissions. CVG has been deprecated.{' '}
              <StyledExternalLink href="https://medium.com/@cvg_wireshark/post-mortem-08-01-2024-e80a49d108a0">
                Learn more here
              </StyledExternalLink>
            </Trans>
          </div>
        ),
      },
      '0x476ef9ac6d8673e220d0e8bc0a810c2dc6a2aa84': {
        alertType: 'danger',
        address: '0x476ef9ac6d8673e220d0e8bc0a810c2dc6a2aa84',
        message: (
          <div>
            <Trans>USPD has been exploited.</Trans>
          </div>
        ),
      },
      '0x85e30b8b263bc64d94b827ed450f2edfee8579da': {
        alertType: 'warning',
        address: '0x85e30b8b263bc64d94b827ed450f2edfee8579da',
        message: (
          <div>
            <Trans>
              The Asymmetry USDaf token will be redeployed. Users advised to unwind USDaf positions.{' '}
              <StyledExternalLink href="https://x.com/asymmetryfin/status/1936870408743223518">
                Learn more here
              </StyledExternalLink>
            </Trans>
          </div>
        ),
      },
    }

    const tokenAddressWithAlert = (tokenAddressAll ?? []).find((tokenAddress) => !!alerts[tokenAddress])
    return tokenAddressWithAlert ? alerts[tokenAddressWithAlert] : null
  }, [tokenAddressAll])

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  word-break: break-word;
`
