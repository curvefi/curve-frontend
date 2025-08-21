import { useMemo } from 'react'
import { styled } from 'styled-components'
import PoolAlertCustomMessage from '@/dex/components/PoolAlertCustomMessage'
import { ROUTE } from '@/dex/constants'
import { PoolAlert, PoolData, PoolDataCache, type UrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import Box from '@ui/Box'
import { RCCrossCurve } from '@ui/images'
import { ExternalLink, InternalLink } from '@ui/Link'
import { breakpoints } from '@ui/utils'
import { useParams } from '@ui-kit/hooks/router'
import { shortenAddress } from '@ui-kit/utils'

/**
 * CrossCurve does not use the usual chainId of networks, but its internal id.
 * In addition, part of the necessary networks are missing in the Chain enum (e.g. Mode)
 */
enum CrossCurveChain {
  Ethereum = 13,
  Optimism = 19,
  Gnosis = 27,
  Moonbeam = 29,
  Polygon = 3,
  Kava = 47,
  Fantom = 15,
  Arbitrum = 7,
  Avalanche = 9,
  Celo = 37,
  Aurora = 17,
  Base = 21,
  Bsc = 1,
  Fraxtal = 23,
  XLayer = 25,
  Mantle = 33,
  Sonic = 53,
  Mode = 51,
  Metis = 49,
  Blast = 31,
  Taiko = 43,
  Linea = 39,
  Manta = 41,
}

// Builder for CrossCurve labels
class CrossCurveLabel {
  static mint(pool: string) {
    return {
      label: 'Mint s-tokens',
      url: `https://app.crosscurve.fi/liquidity?pool=${pool}&action=deposit&type=curve`,
    }
  }

  static redeem(pool: string) {
    return {
      label: 'Redeem s-tokens',
      url: `https://app.crosscurve.fi/liquidity?pool=${pool}&action=withdraw&type=curve`,
    }
  }

  static swap(inputChainId: CrossCurveChain, inputToken: string, outputChainId: CrossCurveChain, outputToken: string) {
    return {
      label: 'Cross-chain swap',
      url: `https://app.crosscurve.fi/swap?${new URLSearchParams({
        inputChainId: inputChainId.toString(),
        inputToken,
        outputChainId: outputChainId.toString(),
        outputToken,
      })}`,
    }
  }
}

const usePoolAlert = (poolData?: PoolData | PoolDataCache) => {
  const params = useParams<UrlParams>()

  const poolAddress = poolData?.pool.address
  const hasVyperVulnerability = poolData?.hasVyperVulnerability
  const [token1, token2] = poolData?.tokenAddresses ?? []

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
      const redirectText = `PRISMA/yPRISMA pool (${shortenAddress('0x69833361991ed76f9e8dbbcdf9ea1520febfb4a7')})`
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
                href="https://gov.curve.finance/t/kill-gauges-on-all-non-susd-curve-pools-on-ethereum/10033/2"
              >
                https://gov.curve.finance/t/kill-gauges-on-all-non-susd-curve-pools-on-ethereum/10033/2
              </ExternalLink>
            </p>
            <p>Please note that sUSD is not involved, so these would be on the other pools sETH, sBTC, sForex ...</p>
          </Box>
        </MessageWrapper>
      ),
    })
    const ironbankAlert = (): PoolAlert => ({
      alertType: 'warning',
      isInformationOnlyAndShowInForm: true,
      message: (
        <MessageWrapper>
          <div>Ironbank protocol is deprecated. Please do not supply liquidity to this pool.</div>
        </MessageWrapper>
      ),
    })
    const synthetixUsdAlert = (): PoolAlert => ({
      alertType: 'danger',
      isDisableDeposit: true,
      isDisableSwap: true,
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      message: (
        <MessageWrapper>
          <div>
            Deposit and swap are disabled, see{' '}
            <ExternalLink $noStyles href="https://x.com/synthetix_io/status/1953054538610688198">
              https://x.com/synthetix_io/status/1953054538610688198
            </ExternalLink>{' '}
            for additional information.
          </div>
        </MessageWrapper>
      ),
    })

    // Fantom networks
    const crossCurveAlert = (externalLinks: { label: string; url: string }[]): PoolAlert => ({
      alertType: '',
      isPoolPageOnly: true,
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
      '0x939721ce04332ca04b100154e0c8fcbb4ebaf695': crossCurveAlert([CrossCurveLabel.redeem('0x939721ce04332ca04b100154e0c8fcbb4ebaf695'), CrossCurveLabel.swap(CrossCurveChain.Polygon, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', CrossCurveChain.Bsc, '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d')]), // Eywa EUSD
      '0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c': crossCurveAlert([CrossCurveLabel.redeem('0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c'), CrossCurveLabel.swap(CrossCurveChain.Polygon, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', CrossCurveChain.Bsc, '0x55d398326f99059ff775485246999027b3197955')]), // Eywa eUSDT
      '0x6bb9a6b7066445da6bef268b91810ae750431587': crossCurveAlert([CrossCurveLabel.redeem('0x6bb9a6b7066445da6bef268b91810ae750431587'), CrossCurveLabel.swap(CrossCurveChain.Polygon, '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', CrossCurveChain.Bsc, '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d')]), // Eywa eUSDC
      '0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2': crossCurveAlert([CrossCurveLabel.redeem('0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2'), CrossCurveLabel.swap(CrossCurveChain.Polygon, '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', CrossCurveChain.Bsc, '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3')]), // Eywa eDAI
      '0x6e0dc5a4ef555277db3435703f0e287040013763': crossCurveAlert([CrossCurveLabel.redeem('0x6e0dc5a4ef555277db3435703f0e287040013763'), CrossCurveLabel.swap(CrossCurveChain.Polygon, '0x2e1ad108ff1d8c782fcbbb89aad783ac49586756', CrossCurveChain.Bsc, '0x40af3827f39d0eacbf4a168f8d4ee67c121d11c9')]), // Eywa eTUSD
      '0x353bb1dfbc52bc3b0e7d264216b1455df00f50be': crossCurveAlert([CrossCurveLabel.mint('0x353bb1dfbc52bc3b0e7d264216b1455df00f50be'), CrossCurveLabel.redeem('0x353bb1dfbc52bc3b0e7d264216b1455df00f50be'), CrossCurveLabel.swap(CrossCurveChain.Polygon, '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', CrossCurveChain.Optimism, '0xc52d7f23a2e460248db6ee192cb23dd12bddcbf6')]), // CrossCurve crvUSDC
      '0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b': crossCurveAlert([CrossCurveLabel.mint('0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b'), CrossCurveLabel.redeem('0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b'), CrossCurveLabel.swap(CrossCurveChain.Polygon, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', CrossCurveChain.Arbitrum, '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f')]), // CrossCurve 3crypto
      '0x7d04f016749c215e52138b06bb35ee8491e739fd': crossCurveAlert([CrossCurveLabel.mint('0x7d04f016749c215e52138b06bb35ee8491e739fd'), CrossCurveLabel.redeem('0x7d04f016749c215e52138b06bb35ee8491e739fd'), CrossCurveLabel.swap(CrossCurveChain.Arbitrum, '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', CrossCurveChain.Polygon, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f')]), // CrossCurve crvUSDT
      '0x3f833ed02629545dd78afc3d585f7f3918a3de62': crossCurveAlert([CrossCurveLabel.mint('0x3f833ed02629545dd78afc3d585f7f3918a3de62'), CrossCurveLabel.redeem('0x3f833ed02629545dd78afc3d585f7f3918a3de62'), CrossCurveLabel.swap(CrossCurveChain.Arbitrum, '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', CrossCurveChain.Polygon, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f')]), // CrossCurve xStable
      '0x3c2fcf53f742345c5c1b3dcb2612a1949bc1f18d': crossCurveAlert([CrossCurveLabel.mint('0x3c2fcf53f742345c5c1b3dcb2612a1949bc1f18d'), CrossCurveLabel.redeem('0x3c2fcf53f742345c5c1b3dcb2612a1949bc1f18d'), CrossCurveLabel.swap(CrossCurveChain.Ethereum, '0x0000000000000000000000000000000000000000', CrossCurveChain.Base, '0x4200000000000000000000000000000000000006')]), // CrossCurve xWETH
      '0x37f5dae6039c8ec4c32ad7d3e2a07acaa55c08f9': crossCurveAlert([CrossCurveLabel.mint('0x37F5dae6039C8eC4c32ad7D3e2a07aCaa55C08f9'), CrossCurveLabel.redeem('0x37F5dae6039C8eC4c32ad7D3e2a07aCaa55C08f9'), CrossCurveLabel.swap(CrossCurveChain.Ethereum, '0xb7ecb2aa52aa64a717180e030241bc75cd946726', CrossCurveChain.Base, '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf')]), // CrossCurve xBTC
      '0xa3a63276b8668583e1b47b979d1093d9aaf431ee': crossCurveAlert([CrossCurveLabel.mint('0xa3a63276b8668583e1b47b979d1093d9aaf431ee'), CrossCurveLabel.redeem('0xa3a63276b8668583e1b47b979d1093d9aaf431ee'), CrossCurveLabel.swap(CrossCurveChain.Celo, '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e', CrossCurveChain.Polygon, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f')]), // CrossCurve xStable2
      '0x15ee0d5f92fd869c2fbf26ea785e9d150353568d': crossCurveAlert([CrossCurveLabel.mint('0x15ee0d5f92fd869c2fbf26ea785e9d150353568d'), CrossCurveLabel.redeem('0x15ee0d5f92fd869c2fbf26ea785e9d150353568d'), CrossCurveLabel.swap(CrossCurveChain.Sonic, '0x29219dd400f2bf60e5a23d13be72b486d4038894', CrossCurveChain.Mode, '0xd988097fb8612cc24eec14542bc03424c656005f')]), // CrossCurve xStable3
      '0xabba40f628f055149f1c7415c4388363392279c3': crossCurveAlert([CrossCurveLabel.mint('0xabba40f628f055149f1c7415c4388363392279c3'), CrossCurveLabel.redeem('0xabba40f628f055149f1c7415c4388363392279c3'), CrossCurveLabel.swap(CrossCurveChain.Mode, '0x4200000000000000000000000000000000000006', CrossCurveChain.Metis, '0x420000000000000000000000000000000000000a')]), // CrossCurve xWETH2
      '0x06a2e1521afde7f7dc30d351dcf04408042f536e': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Fantom, token1, CrossCurveChain.Fantom, token2)]),

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
      '0x2dded6da1bf5dbdf597c45fcfaa3194e53ecfeaf': ironbankAlert(),
      '0xa5407eae9ba41422680e2e00537571bcc53efbfd': synthetixUsdAlert(),
      "0x4f493b7de8aac7d55f71853688b1f7c8f0243c85": crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x3ee841f47947fefbe510366e4bbb49e145484195': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x74345504eaea3d9408fc69ae7eb2d14095643c5b': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x5018be882dcce5e3f2f3b0913ae2096b9b3fb61f': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x383e6b4437b59fff47b619cba855ca29342a8559': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x744793b5110f6ca9cc7cdfe1ce16677c3eb192ef': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x6691dbb44154a9f23f8357c56fc9ff5548a8bdc4': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x5f6c431ac417f0f430b84a666a563fabe681da94': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0xab96aa0ee764924f49fbb372f3b4db9c2cb24ea2': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x90455bd11ce8a67c57d467e634dc142b8e4105aa': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x167478921b907422f8e88b43c4af2b8bea278d3a': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0xce6431d21e3fb1036ce9973a3312368ed96f5ce7': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x5dc1bf6f1e983c0b21efb003c105133736fa0743': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x1d08e7adc263cfc70b1babe6dc5bb339c16eec52': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x14100f81e33c33ecc7cdac70181fb45b6e78569f': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x4dece678ceceb27446b35c672dc7d61f30bad69e': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),
      '0x390f3595bca2df7d23783dfd126427cceb997bf4': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Ethereum, token1, CrossCurveChain.Ethereum, token2)]),

      // arbitrum
      '0x960ea3e3c7fb317332d990873d354e18d7645590': possibleVyperExploitedAlert(), // tricrypto
      '0xe957ce03ccdd88f02ed8b05c9a3a28abef38514a': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Arbitrum, token1, CrossCurveChain.Arbitrum, token2)]),
      '0x845c8bc94610807fcbab5dd2bc7ac9dabaff3c55': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Arbitrum, token1, CrossCurveChain.Arbitrum, token2)]),
      '0x93a416206b4ae3204cfe539edfee6bc05a62963e': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Arbitrum, token1, CrossCurveChain.Arbitrum, token2)]),
      '0x4bd135524897333bec344e50ddd85126554e58b4': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Arbitrum, token1, CrossCurveChain.Arbitrum, token2)]),
      '0x3adf984c937fa6846e5a24e0a68521bdaf767ce1': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Arbitrum, token1, CrossCurveChain.Arbitrum, token2)]),
      
      // avalanche
      '0xb755b949c126c04e0348dd881a5cf55d424742b2': atricryptoAlert(),
      '0xaea2e71b631fa93683bcf256a8689dfa0e094fcd': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Avalanche, token1, CrossCurveChain.Avalanche, token2)]),
      '0x3a43a5851a3e3e0e25a3c1089670269786be1577': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Avalanche, token1, CrossCurveChain.Avalanche, token2)]),
      '0x1da20ac34187b2d9c74f729b85acb225d3341b25': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Avalanche, token1, CrossCurveChain.Avalanche, token2)]),
      
      // sonic
      "0x38dd6b3c096c8cbe649fa0039cc144f333be8e61": crossCurveAlert([CrossCurveLabel.mint('0x38dd6b3c096c8cbe649fa0039cc144f333be8e61'), CrossCurveLabel.redeem('0x38dd6b3c096c8cbe649fa0039cc144f333be8e61'), CrossCurveLabel.swap(CrossCurveChain.Arbitrum, '0x11cdb42b0eb46d95f990bedd4695a6e3fa034978', CrossCurveChain.Ethereum, '0xd533a949740bb3306d119cc777fa900ba034cd52')]), // CrossCurve xCRV
      "0x4fe12cf68147e902f4ccd8a3d4c13e89fba92384": crossCurveAlert([CrossCurveLabel.mint('0x4fe12cf68147e902f4ccd8a3d4c13e89fba92384'), CrossCurveLabel.redeem('0x4fe12cf68147e902f4ccd8a3d4c13e89fba92384'), CrossCurveLabel.swap(CrossCurveChain.Ethereum, '0xdac17f958d2ee523a2206206994597c13d831ec7', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsEthereum
      "0xf159c51297306839b7d44cbb5cb9360e4623ae5a": crossCurveAlert([CrossCurveLabel.mint('0xf159c51297306839b7d44cbb5cb9360e4623ae5a'), CrossCurveLabel.redeem('0xf159c51297306839b7d44cbb5cb9360e4623ae5a'), CrossCurveLabel.swap(CrossCurveChain.Bsc, '0x55d398326f99059ff775485246999027b3197955', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsBSC
      "0xdac15649b025ba0047718512111c34096e9545e8": crossCurveAlert([CrossCurveLabel.mint('0xdac15649b025ba0047718512111c34096e9545e8'), CrossCurveLabel.redeem('0xdac15649b025ba0047718512111c34096e9545e8'), CrossCurveLabel.swap(CrossCurveChain.Avalanche, '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsAvalanche
      "0xf821404ac19ac1786caca7e3e12658d72ece885e": crossCurveAlert([CrossCurveLabel.mint('0xf821404ac19ac1786caca7e3e12658d72ece885e'), CrossCurveLabel.redeem('0xf821404ac19ac1786caca7e3e12658d72ece885e'), CrossCurveLabel.swap(CrossCurveChain.Polygon, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsPolygon
      "0x440bcab62d629ba60ca56b80e565636e0c404e60": crossCurveAlert([CrossCurveLabel.mint('0x440bcab62d629ba60ca56b80e565636e0c404e60'), CrossCurveLabel.redeem('0x440bcab62d629ba60ca56b80e565636e0c404e60'), CrossCurveLabel.swap(CrossCurveChain.Arbitrum, '0xaf88d065e77c8cc2239327c5edb3a432268e5831', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsArbitrum
      "0xd9bf67d8a5d698a028160f62480d456801f0b4b1": crossCurveAlert([CrossCurveLabel.mint('0xd9bf67d8a5d698a028160f62480d456801f0b4b1'), CrossCurveLabel.redeem('0xd9bf67d8a5d698a028160f62480d456801f0b4b1'), CrossCurveLabel.swap(CrossCurveChain.Optimism, '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsOptimism
      "0x435a160ef111ad0aa0867bece7b85cb77dce3c8a": crossCurveAlert([CrossCurveLabel.mint('0x435a160ef111ad0aa0867bece7b85cb77dce3c8a'), CrossCurveLabel.redeem('0x435a160ef111ad0aa0867bece7b85cb77dce3c8a'), CrossCurveLabel.swap(CrossCurveChain.Base, '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsBase
      "0x90135d7300c690d786fa8fea071cd4c2ed080d16": crossCurveAlert([CrossCurveLabel.mint('0x90135d7300c690d786fa8fea071cd4c2ed080d16'), CrossCurveLabel.redeem('0x90135d7300c690d786fa8fea071cd4c2ed080d16'), CrossCurveLabel.swap(CrossCurveChain.Blast, '0x4300000000000000000000000000000000000003', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsBlast
      "0x20c2e44bbbea698da4a4cb687514e66385996639": crossCurveAlert([CrossCurveLabel.mint('0x20c2e44bbbea698da4a4cb687514e66385996639'), CrossCurveLabel.redeem('0x20c2e44bbbea698da4a4cb687514e66385996639'), CrossCurveLabel.swap(CrossCurveChain.Gnosis, '0x4ecaba5870353805a9f068101a40e0f32ed605c6', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsGnosis
      "0xedcf9ef9b389a8f52e81958d8212faf6fbd758ae": crossCurveAlert([CrossCurveLabel.mint('0xedcf9ef9b389a8f52e81958d8212faf6fbd758ae'), CrossCurveLabel.redeem('0xedcf9ef9b389a8f52e81958d8212faf6fbd758ae'), CrossCurveLabel.swap(CrossCurveChain.Taiko, '0x07d83526730c7438048d55a4fc0b850e2aab6f0b', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsTaiko
      "0x6988d6eec3ca7d24c0358bab8018787117325c2b": crossCurveAlert([CrossCurveLabel.mint('0x6988d6eec3ca7d24c0358bab8018787117325c2b'), CrossCurveLabel.redeem('0x6988d6eec3ca7d24c0358bab8018787117325c2b'), CrossCurveLabel.swap(CrossCurveChain.Mantle, '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsMantle
      "0x9e63e5d31fd0136290ef99b3cac4515f346fef1c": crossCurveAlert([CrossCurveLabel.mint('0x9e63e5d31fd0136290ef99b3cac4515f346fef1c'), CrossCurveLabel.redeem('0x9e63e5d31fd0136290ef99b3cac4515f346fef1c'), CrossCurveLabel.swap(CrossCurveChain.Linea, '0x176211869ca2b568f2a7d4ee941e073a821ee1ff', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsLinea
      "0x2b0911095350785fb32a557d1d2e3b36a9bb9252": crossCurveAlert([CrossCurveLabel.mint('0x2b0911095350785fb32a557d1d2e3b36a9bb9252'), CrossCurveLabel.redeem('0x2b0911095350785fb32a557d1d2e3b36a9bb9252'), CrossCurveLabel.swap(CrossCurveChain.Celo, '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsCelo
      "0xaa186960df95495084ef1ddc40a3bdac22b0d343": crossCurveAlert([CrossCurveLabel.mint('0xaa186960df95495084ef1ddc40a3bdac22b0d343'), CrossCurveLabel.redeem('0xaa186960df95495084ef1ddc40a3bdac22b0d343'), CrossCurveLabel.swap(CrossCurveChain.Metis, '0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsMetis
      "0xb7bb92ff0ec68e6d79a238174e42c12ff5ef2b00": crossCurveAlert([CrossCurveLabel.mint('0xb7bb92ff0ec68e6d79a238174e42c12ff5ef2b00'), CrossCurveLabel.redeem('0xb7bb92ff0ec68e6d79a238174e42c12ff5ef2b00'), CrossCurveLabel.swap(CrossCurveChain.Mode, '0xd988097fb8612cc24eec14542bc03424c656005f', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsMode
      "0x024cc841cd7fe4e7dd7253676c688146599923cf": crossCurveAlert([CrossCurveLabel.mint('0x024cc841cd7fe4e7dd7253676c688146599923cf'), CrossCurveLabel.redeem('0x024cc841cd7fe4e7dd7253676c688146599923cf'), CrossCurveLabel.swap(CrossCurveChain.Manta, '0xf417f5a458ec102b90352f697d6e2ac3a3d2851f', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsManta
      "0x2e97cf8da26ce3858950dd85b8f69e39ebd251f5": crossCurveAlert([CrossCurveLabel.mint('0x2e97cf8da26ce3858950dd85b8f69e39ebd251f5'), CrossCurveLabel.redeem('0x2e97cf8da26ce3858950dd85b8f69e39ebd251f5'), CrossCurveLabel.swap(CrossCurveChain.Kava, '0x919c1c267bc06a7039e03fcc2ef738525769109c', CrossCurveChain.Sonic, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsKava
      "0x24479a0d48849781b4386ed91fdd84241673ab1e": crossCurveAlert([CrossCurveLabel.mint('0x24479a0d48849781b4386ed91fdd84241673ab1e'), CrossCurveLabel.redeem('0x24479a0d48849781b4386ed91fdd84241673ab1e'), CrossCurveLabel.swap(CrossCurveChain.Ethereum, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeEthereum
      "0x9ccaabd2610d467b1f76c8aacec4f567ec61d78e": crossCurveAlert([CrossCurveLabel.mint('0x9ccaabd2610d467b1f76c8aacec4f567ec61d78e'), CrossCurveLabel.redeem('0x9ccaabd2610d467b1f76c8aacec4f567ec61d78e'), CrossCurveLabel.swap(CrossCurveChain.Arbitrum, '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeArbitrum
      "0x424757a5169e1f3b45436c9b2e5421dc39dc4897": crossCurveAlert([CrossCurveLabel.mint('0x424757a5169e1f3b45436c9b2e5421dc39dc4897'), CrossCurveLabel.redeem('0x424757a5169e1f3b45436c9b2e5421dc39dc4897'), CrossCurveLabel.swap(CrossCurveChain.Optimism, '0x4200000000000000000000000000000000000006', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeOptimism
      "0xa5a5da9c386855b199b8928cbb59c7ac6505ba89": crossCurveAlert([CrossCurveLabel.mint('0xa5a5da9c386855b199b8928cbb59c7ac6505ba89'), CrossCurveLabel.redeem('0xa5a5da9c386855b199b8928cbb59c7ac6505ba89'), CrossCurveLabel.swap(CrossCurveChain.Base, '0x4200000000000000000000000000000000000006', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeBase
      "0x6f6522261f89d988d5f5caa5e4e658344517b114": crossCurveAlert([CrossCurveLabel.mint('0x6f6522261f89d988d5f5caa5e4e658344517b114'), CrossCurveLabel.redeem('0x6f6522261f89d988d5f5caa5e4e658344517b114'), CrossCurveLabel.swap(CrossCurveChain.Blast, '0x4300000000000000000000000000000000000004', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeBlast
      "0x13882f7f207329db487ce99839c26392a233d97b": crossCurveAlert([CrossCurveLabel.mint('0x13882f7f207329db487ce99839c26392a233d97b'), CrossCurveLabel.redeem('0x13882f7f207329db487ce99839c26392a233d97b'), CrossCurveLabel.swap(CrossCurveChain.Mantle, '0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeMantle
      "0xeb427d3cc29ec4c49e48fccc580b11f15d7d096d": crossCurveAlert([CrossCurveLabel.mint('0xeb427d3cc29ec4c49e48fccc580b11f15d7d096d'), CrossCurveLabel.redeem('0xeb427d3cc29ec4c49e48fccc580b11f15d7d096d'), CrossCurveLabel.swap(CrossCurveChain.Bsc, '0x2170ed0880ac9a755fd29b2688956bd959f933f8', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeBSC
      "0xdbb986d7fef61260c7f9a443e62e8a91974c5e3d": crossCurveAlert([CrossCurveLabel.mint('0xdbb986d7fef61260c7f9a443e62e8a91974c5e3d'), CrossCurveLabel.redeem('0xdbb986d7fef61260c7f9a443e62e8a91974c5e3d'), CrossCurveLabel.swap(CrossCurveChain.Polygon, '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xePolygon
      "0xa4948da3f2007193dd7404278fed15d48c617417": crossCurveAlert([CrossCurveLabel.mint('0xa4948da3f2007193dd7404278fed15d48c617417'), CrossCurveLabel.redeem('0xa4948da3f2007193dd7404278fed15d48c617417'), CrossCurveLabel.swap(CrossCurveChain.Avalanche, '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeAvalanche
      "0x8bb9b3e45fa6b4bf4bbb66ad09f485c5509a0e4c": crossCurveAlert([CrossCurveLabel.mint('0x8bb9b3e45fa6b4bf4bbb66ad09f485c5509a0e4c'), CrossCurveLabel.redeem('0x8bb9b3e45fa6b4bf4bbb66ad09f485c5509a0e4c'), CrossCurveLabel.swap(CrossCurveChain.Gnosis, '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeGnosis
      "0x601538c805ea9d83a49c132f18417db9666f69d5": crossCurveAlert([CrossCurveLabel.mint('0x601538c805ea9d83a49c132f18417db9666f69d5'), CrossCurveLabel.redeem('0x601538c805ea9d83a49c132f18417db9666f69d5'), CrossCurveLabel.swap(CrossCurveChain.Metis, '0x420000000000000000000000000000000000000a', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeMetis
      "0x759a32b417bb471da76cf41ca2ea42f4e0b143eb": crossCurveAlert([CrossCurveLabel.mint('0x759a32b417bb471da76cf41ca2ea42f4e0b143eb'), CrossCurveLabel.redeem('0x759a32b417bb471da76cf41ca2ea42f4e0b143eb'), CrossCurveLabel.swap(CrossCurveChain.Mode, '0x4200000000000000000000000000000000000006', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeMode
      "0xe5a0813a7de6abd8599594e84cb23e4a6d9d9800": crossCurveAlert([CrossCurveLabel.mint('0xe5a0813a7de6abd8599594e84cb23e4a6d9d9800'), CrossCurveLabel.redeem('0xe5a0813a7de6abd8599594e84cb23e4a6d9d9800'), CrossCurveLabel.swap(CrossCurveChain.Linea, '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeLinea
      "0x6d9f0ff2b7f1397ee731f6370d8e4699ffad7bc5": crossCurveAlert([CrossCurveLabel.mint('0x6d9f0ff2b7f1397ee731f6370d8e4699ffad7bc5'), CrossCurveLabel.redeem('0x6d9f0ff2b7f1397ee731f6370d8e4699ffad7bc5'), CrossCurveLabel.swap(CrossCurveChain.Taiko, '0xa51894664a773981c6c112c43ce576f315d5b1b6', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeTaiko
      "0x1008358eecb59723391fba0f8a6b36c5346dab2d": crossCurveAlert([CrossCurveLabel.mint('0x1008358eecb59723391fba0f8a6b36c5346dab2d'), CrossCurveLabel.redeem('0x1008358eecb59723391fba0f8a6b36c5346dab2d'), CrossCurveLabel.swap(CrossCurveChain.Manta, '0x0dc808adce2099a9f62aa87d9670745aba741746', CrossCurveChain.Ethereum, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeManta
      "0x09679c768d17b52bfa059010475f9a0bdb0d6fea": crossCurveAlert([CrossCurveLabel.mint('0x09679c768d17b52bfa059010475f9a0bdb0d6fea'), CrossCurveLabel.redeem('0x09679c768d17b52bfa059010475f9a0bdb0d6fea'), CrossCurveLabel.swap(CrossCurveChain.Ethereum, '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', CrossCurveChain.Ethereum, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbEthereum
      "0x1c404afffba0e70426dc601aeaa6205eca8c9078": crossCurveAlert([CrossCurveLabel.mint('0x1c404afffba0e70426dc601aeaa6205eca8c9078'), CrossCurveLabel.redeem('0x1c404afffba0e70426dc601aeaa6205eca8c9078'), CrossCurveLabel.swap(CrossCurveChain.Arbitrum, '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', CrossCurveChain.Ethereum, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbArbitrum
      "0x7b823067ece11047f83f48647110e7a777e2bf5a": crossCurveAlert([CrossCurveLabel.mint('0x7b823067ece11047f83f48647110e7a777e2bf5a'), CrossCurveLabel.redeem('0x7b823067ece11047f83f48647110e7a777e2bf5a'), CrossCurveLabel.swap(CrossCurveChain.Optimism, '0x68f180fcce6836688e9084f035309e29bf0a2095', CrossCurveChain.Ethereum, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbOptimism
      "0x538a5534543752d5abbc8cd11760f8be3625e7b1": crossCurveAlert([CrossCurveLabel.mint('0x538a5534543752d5abbc8cd11760f8be3625e7b1'), CrossCurveLabel.redeem('0x538a5534543752d5abbc8cd11760f8be3625e7b1'), CrossCurveLabel.swap(CrossCurveChain.Avalanche, '0x152b9d0fdc40c096757f570a51e494bd4b943e50', CrossCurveChain.Ethereum, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbAvalanche
      "0xdb0a43327626c0e3e87ce936bc0cdf2ee9475c22": crossCurveAlert([CrossCurveLabel.mint('0xdb0a43327626c0e3e87ce936bc0cdf2ee9475c22'), CrossCurveLabel.redeem('0xdb0a43327626c0e3e87ce936bc0cdf2ee9475c22'), CrossCurveLabel.swap(CrossCurveChain.Polygon, '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', CrossCurveChain.Ethereum, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbPolygon
      "0x5fa5168497db4ec1964b3208c18cb6157e5652e4": crossCurveAlert([CrossCurveLabel.mint('0x5fa5168497db4ec1964b3208c18cb6157e5652e4'), CrossCurveLabel.redeem('0x5fa5168497db4ec1964b3208c18cb6157e5652e4'), CrossCurveLabel.swap(CrossCurveChain.Bsc, '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', CrossCurveChain.Ethereum, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbBSC
      "0x1894a7203faa464f7afa3b8c319a3cac8beb6cda": crossCurveAlert([CrossCurveLabel.mint('0x1894a7203faa464f7afa3b8c319a3cac8beb6cda'), CrossCurveLabel.redeem('0x1894a7203faa464f7afa3b8c319a3cac8beb6cda'), CrossCurveLabel.swap(CrossCurveChain.Base, '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', CrossCurveChain.Ethereum, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbBase
      "0xee05755051e8b1ccf85747a83d0ef8b00f161180": crossCurveAlert([CrossCurveLabel.mint('0xee05755051e8b1ccf85747a83d0ef8b00f161180'), CrossCurveLabel.redeem('0xee05755051e8b1ccf85747a83d0ef8b00f161180'), CrossCurveLabel.swap(CrossCurveChain.Linea, '0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4', CrossCurveChain.Ethereum, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbLinea
      "0x9b78e02ddddda4117ddf6be8a0fbd15c45907895": crossCurveAlert([CrossCurveLabel.mint('0x9b78e02ddddda4117ddf6be8a0fbd15c45907895'), CrossCurveLabel.redeem('0x9b78e02ddddda4117ddf6be8a0fbd15c45907895'), CrossCurveLabel.swap(CrossCurveChain.Gnosis, '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252', CrossCurveChain.Ethereum, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbGnosis
      '0xff11f56281247ead18db76fd23b252156738fa94': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Sonic, token1, CrossCurveChain.Sonic, token2)]),
      '0xd3dc6b2c947f1bca4d4a85114b34a71985606cd2': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Sonic, token1, CrossCurveChain.Sonic, token2)]),
      '0x2fd7ccda50ed88fe17e15f3d5d8d51da4ccb43f3': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Sonic, token1, CrossCurveChain.Sonic, token2)]),
      '0xd0edf0b0d4c56fc9f229a359979d283350ba944e': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Sonic, token1, CrossCurveChain.Sonic, token2)]),
      
      // base
      '0x302a94e3c28c290eaf2a4605fc52e11eb915f378': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Base, token1, CrossCurveChain.Base, token2)]),
      '0x5ab01ee6208596f2204b85bdfa39d34c2add98f6': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Base, token1, CrossCurveChain.Base, token2)]),
    
      // bsc
      '0x7be2dbf222eec2c2f06e05eab88c168b37144933': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Bsc, token1, CrossCurveChain.Bsc, token2)]),
      '0x80eb9a1b48df52534430a7dc11e63c73669d5a06': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Bsc, token1, CrossCurveChain.Bsc, token2)]),
    
      // fraxtal
      '0xa0d3911349e701a1f49c1ba2dda34b4ce9636569': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Fraxtal, token1, CrossCurveChain.Fraxtal, token2)]),
      '0x6e9b6660b94fa74a8087d7ee14dc28698249d242': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Fraxtal, token1, CrossCurveChain.Fraxtal, token2)]),
      '0xf2f426fe123de7b769b2d4f8c911512f065225d3': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Fraxtal, token1, CrossCurveChain.Fraxtal, token2)]),
      '0x3a38e9b0b5cb034de01d5298fc2ed2d793c0c36f': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Fraxtal, token1, CrossCurveChain.Fraxtal, token2)]),
      '0x63eb7846642630456707c3efbb50a03c79b89d81': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Fraxtal, token1, CrossCurveChain.Fraxtal, token2)]),
      '0x385540fda649a114ffeb943fd73ae82ce7908da3': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Fraxtal, token1, CrossCurveChain.Fraxtal, token2)]),
      '0xa8eb7b41fe8df7ea3de982397ad183721784d987': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Fraxtal, token1, CrossCurveChain.Fraxtal, token2)]),
      '0x9ca648d2f51098941688db9a0beb1dadc2d1b357': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Fraxtal, token1, CrossCurveChain.Fraxtal, token2)]),
      '0x1e199dbe1f7aa237282fe941d5bcc3b167c8ce48': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Fraxtal, token1, CrossCurveChain.Fraxtal, token2)]),
      '0x8b4e5263e8d6cc0bbf31edf14491fc6077b88229': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Fraxtal, token1, CrossCurveChain.Fraxtal, token2)]),
    
      // optimism
      '0xd8dd9a8b2aca88e68c46af9008259d0ec04b7751': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Optimism, token1, CrossCurveChain.Optimism, token2)]),
      '0xb52c9213d318956bfa26df2656b161e3cacbb64d': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Optimism, token1, CrossCurveChain.Optimism, token2)]),
      '0x05fa06d4fb883f67f1cfea0889edbff9e8358101': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Optimism, token1, CrossCurveChain.Optimism, token2)]),
      '0x03771e24b7c9172d163bf447490b142a15be3485': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Optimism, token1, CrossCurveChain.Optimism, token2)]),
      '0xd1b30ba128573fcd7d141c8a987961b40e047bb6': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Optimism, token1, CrossCurveChain.Optimism, token2)]),
    
      // polygon
      '0x864490cf55dc2dee3f0ca4d06f5f80b2bb154a03': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Polygon, token1, CrossCurveChain.Polygon, token2)]),
      '0xd8001ce95a13168aa4f7d70b5298962b7cadf6dd': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Polygon, token1, CrossCurveChain.Polygon, token2)]),
      '0x5225010a0ae133b357861782b0b865a48471b2c5': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Polygon, token1, CrossCurveChain.Polygon, token2)]),
      
      // taiko
      '0x761bee8c6ec207cff409456cdf6856818cd0b83c': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Taiko, token1, CrossCurveChain.Taiko, token2)]),
      '0x3da34fbc8ff2bf12a4dfd499a2361823e348d8d7': crossCurveAlert([CrossCurveLabel.swap(CrossCurveChain.Taiko, token1, CrossCurveChain.Taiko, token2)]),
    }

    if (poolAddress) {
      if (alerts[poolAddress]) {
        return alerts[poolAddress]
      } else if (hasVyperVulnerability) {
        return vyperExploitedAlert()
      }
    }
    return null
  }, [poolAddress, params, hasVyperVulnerability, token1, token2])
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
