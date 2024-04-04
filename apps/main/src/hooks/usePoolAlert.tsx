import React, { useMemo } from 'react'
import styled from 'styled-components'

import { ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils'
import { getPath } from '@/utils/utilsRouter'
import { shortenTokenAddress } from '@/utils'
import useStore from '@/store/useStore'

import { RCCrossCurve } from '@/ui/images'
import { ExternalLink, InternalLink } from '@/ui/Link'
import PoolAlertCustomMessage from '@/components/PoolAlertCustomMessage'

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
    const crossCurveAlert = (externalLinks: { label: string; url: string }[]): PoolAlert => ({
      alertType: '',
      message: (
        <PoolAlertCustomMessage title="CrossCurve links" titleIcon={<RCCrossCurve />} externalLinks={externalLinks} />
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
      '0x939721ce04332ca04b100154e0c8fcbb4ebaf695': crossCurveAlert([{label: 'Redeem e-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x939721ce04332ca04b100154e0c8fcbb4ebaf695&action=withdraw&type=curve'}, { label: 'Cross-chain swap', url: 'https://app.eywa.fi/swap?inputChainId=3&inputToken=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&outputChainId=1&outputToken=0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'}]), // eyma EUSD
      '0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c': crossCurveAlert([{label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c&action=withdraw&type=curve'}, { label: 'Cross-chain swap', url: 'https://app.eywa.fi/swap?inputChainId=3&inputToken=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&outputChainId=1&outputToken=0x55d398326f99059ff775485246999027b3197955'}]), // eyma eUSDT
      '0x6bb9a6b7066445da6bef268b91810ae750431587': crossCurveAlert([{label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x6bb9a6b7066445da6bef268b91810ae750431587&action=withdraw&type=curve'}, { label: 'Cross-chain swap', url: 'https://app.eywa.fi/swap?inputChainId=3&inputToken=0x2791bca1f2de4661ed88a30c99a7a9449aa84174&outputChainId=1&outputToken=0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'}]), // eyma eUSDC
      '0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2': crossCurveAlert([{label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2&action=withdraw&type=curve'}, { label: 'Cross-chain swap', url: 'https://app.eywa.fi/swap?inputChainId=3&inputToken=0x8f3cf7ad23cd3cadbd9735aff958023239c6a063&outputChainId=1&outputToken=0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'}]), // eyma eDAI
      '0x6e0dc5a4ef555277db3435703f0e287040013763': crossCurveAlert([{label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x6e0dc5a4ef555277db3435703f0e287040013763&action=withdraw&type=curve'}, { label: 'Cross-chain swap', url: 'https://app.eywa.fi/swap?inputChainId=3&inputToken=0x2e1ad108ff1d8c782fcbbb89aad783ac49586756&outputChainId=1&outputToken=0x40af3827f39d0eacbf4a168f8d4ee67c121d11c9'}]), // eyma eTUSD
      '0x353bb1dfbc52bc3b0e7d264216b1455df00f50be': crossCurveAlert([{label: 'Mint s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x353bb1dfbc52bc3b0e7d264216b1455df00f50be&action=deposit&type=curve'}, {label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x353bb1dfbc52bc3b0e7d264216b1455df00f50be&action=withdraw&type=curve'}, {label: 'Cross-chain swap', url: 'https://app.crosscurve.fi/swap?inputChainId=137&inputToken=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&outputChainId=10&outputToken=0xc52d7f23a2e460248db6ee192cb23dd12bddcbf6'}]), // CrossCurve crvUSDC
      '0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b': crossCurveAlert([{label: 'Mint s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b&action=deposit&type=curve'}, {label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b&action=withdraw&type=curve'}, {label: 'Cross-chain swap', url: 'https://app.crosscurve.fi/swap?inputChainId=137&inputToken=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&outputChainId=42161&outputToken=0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'}]), // CrossCurve 3crypto
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

export default usePoolAlert
