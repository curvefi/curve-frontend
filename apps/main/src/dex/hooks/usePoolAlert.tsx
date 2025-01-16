import React, { useMemo } from 'react'
import styled from 'styled-components'

import { ROUTE } from '@/dex/constants'
import { breakpoints } from '@ui/utils'
import { getPath } from '@/dex/utils/utilsRouter'
import { shortenTokenAddress } from '@/dex/utils'
import useStore from '@/dex/store/useStore'

import { RCCrossCurve } from '@ui/images'
import { ExternalLink, InternalLink } from '@ui/Link'
import Box from '@ui/Box'
import PoolAlertCustomMessage from '@/dex/components/PoolAlertCustomMessage'

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
    const synthetixAlert = (): PoolAlert => ({
      alertType: 'warning',
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      minWidth: '350px',
      message: (
        <MessageWrapper>
          <Box grid gridGap={2}>
            <p>
              Please note that exchanges on synthetix synths are expected to be disabled and users can either withdraw
              liquidity from the underlying token, or redeem their synths to sUSD on{' '}
              <ExternalLink $noStyles href="https://staking.synthetix.io/wallet/balances/">
                https://staking.synthetix.io/wallet/balances/
              </ExternalLink>
            </p>
            <p>
              Users are encouraged to exit the pools in order to avoid getting their holdings&lsquo; value diluted with
              the discountRate For more information please refer to{' '}
              <ExternalLink
                $noStyles
                href="https://gov.curve.fi/t/kill-gauges-on-all-non-susd-curve-pools-on-ethereum/10033/2"
              >
                https://gov.curve.fi/t/kill-gauges-on-all-non-susd-curve-pools-on-ethereum/10033/2
              </ExternalLink>
            </p>
            <p>Please note that sUSD is not involved, so these would be on the other pools sETH, sBTC, sForex ...</p>
          </Box>
        </MessageWrapper>
      ),
    })

    // Fantom networks
    const crossCurveAlert = (externalLinks: { label: string; url: string }[]): PoolAlert => ({
      alertType: '',
      message: (
        <PoolAlertCustomMessage title="CrossCurve links" titleIcon={<RCCrossCurve />} externalLinks={externalLinks} />
      ),
    })

    // Avalanche
    const atricryptoAlert = (): PoolAlert => ({
      alertType: 'info',
      isCloseOnTooltipOnly: true,
      isInformationOnlyAndShowInForm: true,
      message: (
        <MessageWrapper>
          <div>
            Deposit and Swap with wBTC.e will return an error due to an Aave community decision to freeze this asset.{' '}
            <ExternalLink $noStyles href="https://app.aave.com/governance/v3/proposal/?proposalId=2">
              More details
            </ExternalLink>
          </div>
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
      '0x939721ce04332ca04b100154e0c8fcbb4ebaf695': crossCurveAlert([{label: 'Redeem e-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x939721ce04332ca04b100154e0c8fcbb4ebaf695&action=withdraw&type=curve'}, { label: 'Cross-chain swap', url: 'https://app.eywa.fi/swap?inputChainId=3&inputToken=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&outputChainId=1&outputToken=0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'}]), // eyma EUSD
      '0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c': crossCurveAlert([{label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c&action=withdraw&type=curve'}, { label: 'Cross-chain swap', url: 'https://app.eywa.fi/swap?inputChainId=3&inputToken=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&outputChainId=1&outputToken=0x55d398326f99059ff775485246999027b3197955'}]), // eyma eUSDT
      '0x6bb9a6b7066445da6bef268b91810ae750431587': crossCurveAlert([{label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x6bb9a6b7066445da6bef268b91810ae750431587&action=withdraw&type=curve'}, { label: 'Cross-chain swap', url: 'https://app.eywa.fi/swap?inputChainId=3&inputToken=0x2791bca1f2de4661ed88a30c99a7a9449aa84174&outputChainId=1&outputToken=0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'}]), // eyma eUSDC
      '0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2': crossCurveAlert([{label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2&action=withdraw&type=curve'}, { label: 'Cross-chain swap', url: 'https://app.eywa.fi/swap?inputChainId=3&inputToken=0x8f3cf7ad23cd3cadbd9735aff958023239c6a063&outputChainId=1&outputToken=0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'}]), // eyma eDAI
      '0x6e0dc5a4ef555277db3435703f0e287040013763': crossCurveAlert([{label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x6e0dc5a4ef555277db3435703f0e287040013763&action=withdraw&type=curve'}, { label: 'Cross-chain swap', url: 'https://app.eywa.fi/swap?inputChainId=3&inputToken=0x2e1ad108ff1d8c782fcbbb89aad783ac49586756&outputChainId=1&outputToken=0x40af3827f39d0eacbf4a168f8d4ee67c121d11c9'}]), // eyma eTUSD
      '0x353bb1dfbc52bc3b0e7d264216b1455df00f50be': crossCurveAlert([{label: 'Mint s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x353bb1dfbc52bc3b0e7d264216b1455df00f50be&action=deposit&type=curve'}, {label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x353bb1dfbc52bc3b0e7d264216b1455df00f50be&action=withdraw&type=curve'}, {label: 'Cross-chain swap', url: 'https://app.crosscurve.fi/swap?inputChainId=137&inputToken=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&outputChainId=10&outputToken=0xc52d7f23a2e460248db6ee192cb23dd12bddcbf6'}]), // CrossCurve crvUSDC
      '0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b': crossCurveAlert([{label: 'Mint s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b&action=deposit&type=curve'}, {label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b&action=withdraw&type=curve'}, {label: 'Cross-chain swap', url: 'https://app.crosscurve.fi/swap?inputChainId=137&inputToken=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&outputChainId=42161&outputToken=0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'}]), // CrossCurve 3crypto
      '0x7d04f016749c215e52138b06bb35ee8491e739fd': crossCurveAlert([{label: 'Mint s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x7d04f016749c215e52138b06bb35ee8491e739fd&action=deposit&type=curve'}, {label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x7d04f016749c215e52138b06bb35ee8491e739fd&action=withdraw&type=curve'}, {label: 'Cross-chain swap', url: 'https://app.crosscurve.fi/swap?inputChainId=7&inputToken=0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9&outputChainId=3&outputToken=0xc2132d05d31c914a87c6611c10748aeb04b58e8f'}]), // CrossCurve crvUSDT
      '0x3f833ed02629545dd78afc3d585f7f3918a3de62': crossCurveAlert([{label: 'Mint s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x3f833ed02629545dd78afc3d585f7f3918a3de62&action=deposit&type=curve'}, {label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x3f833ed02629545dd78afc3d585f7f3918a3de62&action=withdraw&type=curve'}, {label: 'Cross-chain swap', url: 'https://app.crosscurve.fi/swap?inputChainId=7&inputToken=0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9&outputChainId=3&outputToken=0xc2132d05d31c914a87c6611c10748aeb04b58e8f' }]), // CrossCurve xStable
      '0x3c2fcf53f742345c5c1b3dcb2612a1949bc1f18d': crossCurveAlert([{label: 'Mint s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x3c2fcf53f742345c5c1b3dcb2612a1949bc1f18d&action=deposit&type=curve'}, {label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x3c2fcf53f742345c5c1b3dcb2612a1949bc1f18d&action=withdraw&type=curve'}, {label: 'Cross-chain swap', url: 'https://app.crosscurve.fi/swap?inputChainId=13&inputToken=0x0000000000000000000000000000000000000000&outputChainId=21&outputToken=0x4200000000000000000000000000000000000006' }]), // CrossCurve xWETH
      '0x37f5dae6039c8ec4c32ad7d3e2a07acaa55c08f9': crossCurveAlert([{label: 'Mint s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x37F5dae6039C8eC4c32ad7D3e2a07aCaa55C08f9&action=deposit&type=curve'}, {label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x37F5dae6039C8eC4c32ad7D3e2a07aCaa55C08f9&action=withdraw&type=curve'}, {label: 'Cross-chain swap', url: 'https://app.crosscurve.fi/swap?inputChainId=13&inputToken=0xb7ecb2aa52aa64a717180e030241bc75cd946726&outputChainId=21&outputToken=0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf' }]), // CrossCurve xBTC
      '0xa3a63276b8668583e1b47b979d1093d9aaf431ee': crossCurveAlert([{label: 'Mint s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0xa3a63276b8668583e1b47b979d1093d9aaf431ee&action=deposit&type=curve'}, {label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0xa3a63276b8668583e1b47b979d1093d9aaf431ee&action=withdraw&type=curve'}, {label: 'Cross-chain swap', url: 'https://app.crosscurve.fi/swap?inputChainId=37&inputToken=0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e&outputChainId=3&outputToken=0xc2132d05d31c914a87c6611c10748aeb04b58e8f' }]), // CrossCurve xStable2
      '0x15ee0d5f92fd869c2fbf26ea785e9d150353568d': crossCurveAlert([{label: 'Mint s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x15ee0d5f92fd869c2fbf26ea785e9d150353568d&action=deposit&type=curve'}, {label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0x15ee0d5f92fd869c2fbf26ea785e9d150353568d&action=withdraw&type=curve'}, {label: 'Cross-chain swap', url: 'https://app.crosscurve.fi/swap?inputChainId=53&inputToken=0x29219dd400f2bf60e5a23d13be72b486d4038894&outputChainId=51&outputToken=0xd988097fb8612cc24eec14542bc03424c656005f' }]), // CrossCurve xStable3
      '0xabba40f628f055149f1c7415c4388363392279c3': crossCurveAlert([{label: 'Mint s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0xabba40f628f055149f1c7415c4388363392279c3&action=deposit&type=curve'}, {label: 'Redeem s-tokens', url: 'https://app.crosscurve.fi/liquidity?pool=0xabba40f628f055149f1c7415c4388363392279c3&action=withdraw&type=curve'}, {label: 'Cross-chain swap', url: 'https://app.crosscurve.fi/swap?inputChainId=51&inputToken=0x4200000000000000000000000000000000000006&outputChainId=49&outputToken=0x420000000000000000000000000000000000000a' }]), // CrossCurve xWETH2
      // ethereum
      '0xfc89b519658967fcbe1f525f1b8f4bf62d9b9018': zunamiAlert(),
      '0xfc636d819d1a98433402ec9dec633d864014f28c': zunamiAlert(),
      '0x68934f60758243eafaf4d2cfed27bf8010bede3a': zunamiAlert(),
      '0x0fa949783947bf6c1b171db13aeacbb488845b3f': geistFinanceAlert(),
      '0xc2d54ffb8a61e146110d2fbdd03b12467fe155ac': yPrismaAlert(),
      '0xf253f83aca21aabd2a20553ae0bf7f65c755a07f': synthetixAlert(),
      '0x7fc77b5c7614e1533320ea6ddc2eb61fa00a9714': synthetixAlert(),
      '0xc5424b857f758e906013f3555dad202e4bdb4567': synthetixAlert(),
      '0x0ce6a5ff5217e38315f87032cf90686c96627caa': synthetixAlert(),
      '0x9c2c8910f113181783c249d8f6aa41b51cde0f0c': synthetixAlert(),
      '0x8461a004b50d321cb22b7d034969ce6803911899': synthetixAlert(),
      '0x19b080fe1ffa0553469d20ca36219f17fcf03859': synthetixAlert(),
      '0x8818a9bb44fbf33502be7c15c500d0c783b73067': synthetixAlert(),
      '0x3f1b0278a9ee595635b61817630cc19de792f506': synthetixAlert(),
      // arbitrum
      '0x960ea3e3c7fb317332d990873d354e18d7645590': possibleVyperExploitedAlert(), // tricrypto
      // avalanche
      '0xb755b949c126c04e0348dd881a5cf55d424742b2': atricryptoAlert(),
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
