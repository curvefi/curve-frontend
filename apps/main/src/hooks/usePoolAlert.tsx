import { t } from '@lingui/macro'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils'
import { getPath } from '@/utils/utilsRouter'
import { shortenTokenAddress } from '@/utils'

import { Chip } from '@/ui/Typography'
import { RCEywa } from '@/ui/images'
import { ExternalLink, InternalLink } from '@/ui/Link'
import Icon from '@/ui/Icon'
import useStore from '@/store/useStore'

const usePoolAlert = (poolAddress: string | undefined, hasVyperVulnerability: boolean | undefined) => {
  const params = useStore((state) => state.routerProps?.params)

  return useMemo(() => {
    // Ethereum
    const zunamiAlert = (): PoolAlert => ({
      alertType: 'danger',
      isDisableDeposit: true,
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      message: (
        <MessageWrapper>
          <div>
            zStables (zETH, UZD) have encountered an attack. The collateral remain secure, we delve into the ongoing
            investigation. <span style={{ whiteSpace: 'nowrap' }}>—Zunami Protocol</span>{' '}
            <ExternalLink $noStyles href="https://twitter.com/ZunamiProtocol/status/1690863406079696896?s=20">
              https://twitter.com/ZunamiProtocol/status/1690863406079696896?s=20
            </ExternalLink>
          </div>
        </MessageWrapper>
      ),
    })
    const geistFinanceAlert = (): PoolAlert => ({
      alertType: 'warning',
      isDisableDeposit: true,
      isDisableSwap: true,
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      message: (
        <MessageWrapper>
          <div>
            Deposit and swap are disabled, see{' '}
            <ExternalLink $noStyles href="https://twitter.com/geistfinance">
              https://twitter.com/geistfinance
            </ExternalLink>{' '}
            for additional information.
          </div>
        </MessageWrapper>
      ),
    })
    const yPrismaAlert = (): PoolAlert => {
      const redirectPathname = params && getPath(params, `${ROUTE.PAGE_POOLS}/factory-v2-372${ROUTE.PAGE_POOL_DEPOSIT}`)
      const redirectText = `PRISMA/yPRISMA pool (${shortenTokenAddress('0x69833361991ed76f9e8dbbcdf9ea1520febfb4a7')})`
      return {
        isDisableDeposit: true,
        isInformationOnly: true,
        isCloseOnTooltipOnly: true,
        alertType: 'warning',
        message: (
          <MessageWrapper>
            <div>
              This pool has been deprecated. Please use the{' '}
              {redirectPathname ? (
                <InternalLink $noStyles href={redirectPathname}>
                  {redirectText}
                </InternalLink>
              ) : (
                <span>{redirectText}</span>
              )}{' '}
              instead.
            </div>
          </MessageWrapper>
        ),
      }
    }

    // Fantom networks
    const eymaAlert = (liquidityLink: string, swapLink: string): PoolAlert => ({
      alertType: '',
      message: (
        <MessageWrapper>
          <Title>
            <CustomIconWrapper>
              <RCEywa />
            </CustomIconWrapper>
            {t`EYWA Links:`}
          </Title>{' '}
          <MessageLinksWrapper>
            <StyledChip isBold>
              <StyledExternalLink href={liquidityLink}>
                mint s-tokens <Icon className="svg-tooltip" name="Launch" size={16} />
              </StyledExternalLink>
            </StyledChip>{' '}
            <StyledChip isBold>
              <StyledExternalLink href={swapLink}>
                cross-chain swap <Icon className="svg-tooltip" name="Launch" size={16} />
              </StyledExternalLink>
            </StyledChip>
          </MessageLinksWrapper>
        </MessageWrapper>
      ),
    })

    // all networks
    const vyperExploitedAlert = (): PoolAlert => ({
      alertType: 'danger',
      isDisableDeposit: true,
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      message: (
        <MessageWrapper>
          <div>
            This pool has been exploited due to a vulnerability found in Vyper versions v0.2.15, v0.2.16, or v0.3.0. For
            additional information, please click on the post-mortem link:{' '}
            <ExternalLink $noStyles href="https://hackmd.io/@LlamaRisk/BJzSKHNjn">
              https://hackmd.io/@LlamaRisk/BJzSKHNjn
            </ExternalLink>
          </div>
        </MessageWrapper>
      ),
    })
    const possibleVyperExploitedAlert = (): PoolAlert => ({
      alertType: 'danger',
      isDisableDeposit: true,
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      message: (
        <MessageWrapper>
          <div>
            This pool might be at risk of being exploited. While security researchers have not identified a profitable
            exploit, we recommend exiting this pool.{' '}
            <ExternalLink $noStyles href="https://twitter.com/CurveFinance/status/1685925429041917952">
              https://twitter.com/CurveFinance/status/1685925429041917952
            </ExternalLink>
          </div>
        </MessageWrapper>
      ),
    })

    // prettier-ignore
    const alerts: { [poolAddress: string]: PoolAlert } = {
      // fantom
      '0x939721ce04332ca04b100154e0c8fcbb4ebaf695': eymaAlert('https://app.eywa.fi/swap?inputChainId=15&inputToken=0x6bb9a6b7066445da6bef268b91810ae750431587&outputChainId=15&outputToken=0x939721ce04332ca04b100154e0c8fcbb4ebaf695', 'https://app.eywa.fi/swap?inputChainId=15&inputToken=0x6bb9a6b7066445da6bef268b91810ae750431587&outputChainId=15&outputToken=0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c'), // eyma EUSD
      '0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c': eymaAlert('https://app.eywa.fi/swap?inputChainId=15&inputToken=0x5211176fc476da0601b42cf71518d026fc093de6&outputChainId=15&outputToken=0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c', 'https://app.eywa.fi/swap?inputChainId=15&inputToken=0x5211176fc476da0601b42cf71518d026fc093de6&outputChainId=15&outputToken=0x40fc7408a060cbef1fe63f7182870184d7ff95e3'), // eyma eUSDT
      '0x6bb9a6b7066445da6bef268b91810ae750431587': eymaAlert('https://app.eywa.fi/swap?inputChainId=15&inputToken=0x11326a37e262189aefb03484a681539afb80c1a2&outputChainId=15&outputToken=0x6bb9a6b7066445da6bef268b91810ae750431587', 'https://app.eywa.fi/swap?inputChainId=15&inputToken=0x11326a37e262189aefb03484a681539afb80c1a2&outputChainId=15&outputToken=0xbf25a2cb61f453ce8ea84c369a9907abdaaa6056'), // eyma eUSDC
      '0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2': eymaAlert('https://app.eywa.fi/swap?inputChainId=15&inputToken=0x7e1f532f86bca89d91f61085a26bfc3ab3264fe8&outputChainId=15&outputToken=0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2', 'https://app.eywa.fi/swap?inputChainId=15&inputToken=0x7e1f532f86bca89d91f61085a26bfc3ab3264fe8&outputChainId=15&outputToken=0xd33fbb4951fc744af374595cf7f0a5b62b0540a7'), // eyma eDAI
      '0x6e0dc5a4ef555277db3435703f0e287040013763': eymaAlert('https://app.eywa.fi/swap?inputChainId=15&inputToken=0x399991f54ec6e4353d18a8e975ae4f68cfa234d6&outputChainId=15&outputToken=0x6e0dc5a4ef555277db3435703f0e287040013763', 'https://app.eywa.fi/swap?inputChainId=15&inputToken=0x399991f54ec6e4353d18a8e975ae4f68cfa234d6&outputChainId=15&outputToken=0xf4cd12d90b407d2bbc2ce4047d673f29c5513097'), // eyma eTUSD
      // ethereum
      '0xfc89b519658967fcbe1f525f1b8f4bf62d9b9018': zunamiAlert(),
      '0xfc636d819d1a98433402ec9dec633d864014f28c': zunamiAlert(),
      '0x68934f60758243eafaf4d2cfed27bf8010bede3a': zunamiAlert(),
      '0x0fa949783947bf6c1b171db13aeacbb488845b3f': geistFinanceAlert(),
      '0xc2d54ffb8a61e146110d2fbdd03b12467fe155ac': yPrismaAlert(),
      // arbitrum
      '0x960ea3e3c7fb317332d990873d354e18d7645590': possibleVyperExploitedAlert(), // tricrypto
    }

    if (poolAddress) {
      if (alerts[poolAddress]) {
        return alerts[poolAddress]
      } else if (hasVyperVulnerability) {
        return vyperExploitedAlert()
      }
    }
    return null
  }, [poolAddress, params, hasVyperVulnerability])
}

const MessageWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;

  a {
    word-break: break-word;
  }

  @media (min-width: ${breakpoints.sm}rem) {
    align-items: center;
    flex-direction: row;
  }
`

const MessageLinksWrapper = styled.div`
  display: inline-block;
`

const CustomIconWrapper = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 0.2rem;
`

const Title = styled.span`
  align-items: center;
  display: flex;
  font-size: var(--font-size-3);
  font-weight: bold;
  white-space: nowrap;
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  text-transform: initial;
`

const StyledChip = styled(Chip)`
  display: inline-block;
  opacity: 0.75;
  background-color: hsl(0deg 0% 50% / 10%);
  padding: 0.2rem 0.5rem 0.4rem;
  margin: 0.25rem 0.25rem 0 0;

  :hover {
    opacity: 1;
  }

  ${StyledExternalLink} {
    font-size: var(--font-size-1);
    text-decoration: none;
    text-transform: uppercase;

    :hover {
      color: inherit;
      text-transform: uppercase;
    }
  }

  @media (min-width: ${breakpoints.sm}rem) {
    margin: 0 0.2rem;
  }
`

export default usePoolAlert
