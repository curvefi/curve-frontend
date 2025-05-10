import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import styled from 'styled-components'
import PoolAlertCustomMessage from '@/dex/components/PoolAlertCustomMessage'
import { ROUTE } from '@/dex/constants'
import { PoolAlert, type UrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import Box from '@ui/Box'
import { RCCrossCurve } from '@ui/images'
import { ExternalLink, InternalLink } from '@ui/Link'
import { breakpoints } from '@ui/utils'
import { shortenAddress } from '@ui-kit/utils'

// Builder for CrossCurve labels
const CrossCurveLabel = {
  mint(pool: string) {
    return {
      label: 'Mint s-tokens',
      url: `https://app.crosscurve.fi/liquidity?pool=${pool}&action=deposit&type=curve`,
    }
  },
  redeem(pool: string) {
    return {
      label: 'Redeem s-tokens',
      url: `https://app.crosscurve.fi/liquidity?pool=${pool}&action=withdraw&type=curve`,
    }
  },
  swap(inputChainId: number, inputToken: string, outputChainId: number, outputToken: string) {
    return {
      label: 'Cross-chain swap',
      url: `https://app.crosscurve.fi/swap?inputChainId=${inputChainId}&inputToken=${inputToken}&outputChainId=${outputChainId}&outputToken=${outputToken}`,
    }
  },
}

const usePoolAlert = (poolAddress: string | undefined, hasVyperVulnerability: boolean | undefined) => {
  const params = useParams() as UrlParams

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
      '0x939721ce04332ca04b100154e0c8fcbb4ebaf695': crossCurveAlert([CrossCurveLabel.redeem('0x939721ce04332ca04b100154e0c8fcbb4ebaf695'), CrossCurveLabel.swap(3, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 1, '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d')]), // Eywa EUSD
      '0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c': crossCurveAlert([CrossCurveLabel.redeem('0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c'), CrossCurveLabel.swap(3, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 1, '0x55d398326f99059ff775485246999027b3197955')]), // Eywa eUSDT
      '0x6bb9a6b7066445da6bef268b91810ae750431587': crossCurveAlert([CrossCurveLabel.redeem('0x6bb9a6b7066445da6bef268b91810ae750431587'), CrossCurveLabel.swap(3, '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', 1, '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d')]), // Eywa eUSDC
      '0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2': crossCurveAlert([CrossCurveLabel.redeem('0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2'), CrossCurveLabel.swap(3, '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', 1, '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3')]), // Eywa eDAI
      '0x6e0dc5a4ef555277db3435703f0e287040013763': crossCurveAlert([CrossCurveLabel.redeem('0x6e0dc5a4ef555277db3435703f0e287040013763'), CrossCurveLabel.swap(3, '0x2e1ad108ff1d8c782fcbbb89aad783ac49586756', 1, '0x40af3827f39d0eacbf4a168f8d4ee67c121d11c9')]), // Eywa eTUSD
      '0x353bb1dfbc52bc3b0e7d264216b1455df00f50be': crossCurveAlert([CrossCurveLabel.mint('0x353bb1dfbc52bc3b0e7d264216b1455df00f50be'), CrossCurveLabel.redeem('0x353bb1dfbc52bc3b0e7d264216b1455df00f50be'), CrossCurveLabel.swap(137, '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', 10, '0xc52d7f23a2e460248db6ee192cb23dd12bddcbf6')]), // CrossCurve crvUSDC
      '0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b': crossCurveAlert([CrossCurveLabel.mint('0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b'), CrossCurveLabel.redeem('0x5ecac5fb1d9634f9e1c2dab2381b9adaada5f80b'), CrossCurveLabel.swap(137, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 42161, '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f')]), // CrossCurve 3crypto
      '0x7d04f016749c215e52138b06bb35ee8491e739fd': crossCurveAlert([CrossCurveLabel.mint('0x7d04f016749c215e52138b06bb35ee8491e739fd'), CrossCurveLabel.redeem('0x7d04f016749c215e52138b06bb35ee8491e739fd'), CrossCurveLabel.swap(7, '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', 3, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f')]), // CrossCurve crvUSDT
      '0x3f833ed02629545dd78afc3d585f7f3918a3de62': crossCurveAlert([CrossCurveLabel.mint('0x3f833ed02629545dd78afc3d585f7f3918a3de62'), CrossCurveLabel.redeem('0x3f833ed02629545dd78afc3d585f7f3918a3de62'), CrossCurveLabel.swap(7, '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', 3, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f')]), // CrossCurve xStable
      '0x3c2fcf53f742345c5c1b3dcb2612a1949bc1f18d': crossCurveAlert([CrossCurveLabel.mint('0x3c2fcf53f742345c5c1b3dcb2612a1949bc1f18d'), CrossCurveLabel.redeem('0x3c2fcf53f742345c5c1b3dcb2612a1949bc1f18d'), CrossCurveLabel.swap(13, '0x0000000000000000000000000000000000000000', 21, '0x4200000000000000000000000000000000000006')]), // CrossCurve xWETH
      '0x37f5dae6039c8ec4c32ad7d3e2a07acaa55c08f9': crossCurveAlert([CrossCurveLabel.mint('0x37F5dae6039C8eC4c32ad7D3e2a07aCaa55C08f9'), CrossCurveLabel.redeem('0x37F5dae6039C8eC4c32ad7D3e2a07aCaa55C08f9'), CrossCurveLabel.swap(13, '0xb7ecb2aa52aa64a717180e030241bc75cd946726', 21, '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf')]), // CrossCurve xBTC
      '0xa3a63276b8668583e1b47b979d1093d9aaf431ee': crossCurveAlert([CrossCurveLabel.mint('0xa3a63276b8668583e1b47b979d1093d9aaf431ee'), CrossCurveLabel.redeem('0xa3a63276b8668583e1b47b979d1093d9aaf431ee'), CrossCurveLabel.swap(37, '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e', 3, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f')]), // CrossCurve xStable2
      '0x15ee0d5f92fd869c2fbf26ea785e9d150353568d': crossCurveAlert([CrossCurveLabel.mint('0x15ee0d5f92fd869c2fbf26ea785e9d150353568d'), CrossCurveLabel.redeem('0x15ee0d5f92fd869c2fbf26ea785e9d150353568d'), CrossCurveLabel.swap(53, '0x29219dd400f2bf60e5a23d13be72b486d4038894', 51, '0xd988097fb8612cc24eec14542bc03424c656005f')]), // CrossCurve xStable3
      '0xabba40f628f055149f1c7415c4388363392279c3': crossCurveAlert([CrossCurveLabel.mint('0xabba40f628f055149f1c7415c4388363392279c3'), CrossCurveLabel.redeem('0xabba40f628f055149f1c7415c4388363392279c3'), CrossCurveLabel.swap(51, '0x4200000000000000000000000000000000000006', 49, '0x420000000000000000000000000000000000000a')]), // CrossCurve xWETH2
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
      // sonic
      "0x38dd6b3c096c8cbe649fa0039cc144f333be8e61": crossCurveAlert([CrossCurveLabel.mint('0x38dd6b3c096c8cbe649fa0039cc144f333be8e61'), CrossCurveLabel.redeem('0x38dd6b3c096c8cbe649fa0039cc144f333be8e61'), CrossCurveLabel.swap(7, '0x11cdb42b0eb46d95f990bedd4695a6e3fa034978', 13, '0xd533a949740bb3306d119cc777fa900ba034cd52')]), // CrossCurve xCRV
      "0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84": crossCurveAlert([CrossCurveLabel.mint('0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84'), CrossCurveLabel.redeem('0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84'), CrossCurveLabel.swap(53, '0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae', 53, '0x80eede496655fb9047dd39d9f418d5483ed600df')]), // CrossCurve xfrxUSD
      "0x346704605c72d9f5f9f02d651e5a3dcce6964f3d": crossCurveAlert([CrossCurveLabel.mint('0x346704605c72d9f5f9f02d651e5a3dcce6964f3d'), CrossCurveLabel.redeem('0x346704605c72d9f5f9f02d651e5a3dcce6964f3d'), CrossCurveLabel.swap(53, '0x3bce5cb273f0f148010bbea2470e7b5df84c7812', 53, '0x43edd7f3831b08fe70b7555ddd373c8bf65a9050')]), // CrossCurve xfrxETH
      "0x4fe12cf68147e902f4ccd8a3d4c13e89fba92384": crossCurveAlert([CrossCurveLabel.mint('0x4fe12cf68147e902f4ccd8a3d4c13e89fba92384'), CrossCurveLabel.redeem('0x4fe12cf68147e902f4ccd8a3d4c13e89fba92384'), CrossCurveLabel.swap(13, '0xdac17f958d2ee523a2206206994597c13d831ec7', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsEthereum
      "0xf159c51297306839b7d44cbb5cb9360e4623ae5a": crossCurveAlert([CrossCurveLabel.mint('0xf159c51297306839b7d44cbb5cb9360e4623ae5a'), CrossCurveLabel.redeem('0xf159c51297306839b7d44cbb5cb9360e4623ae5a'), CrossCurveLabel.swap(1, '0x55d398326f99059ff775485246999027b3197955', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsBSC
      "0xdac15649b025ba0047718512111c34096e9545e8": crossCurveAlert([CrossCurveLabel.mint('0xdac15649b025ba0047718512111c34096e9545e8'), CrossCurveLabel.redeem('0xdac15649b025ba0047718512111c34096e9545e8'), CrossCurveLabel.swap(9, '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsAvalanche
      "0xf821404ac19ac1786caca7e3e12658d72ece885e": crossCurveAlert([CrossCurveLabel.mint('0xf821404ac19ac1786caca7e3e12658d72ece885e'), CrossCurveLabel.redeem('0xf821404ac19ac1786caca7e3e12658d72ece885e'), CrossCurveLabel.swap(3, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsPolygon
      "0x440bcab62d629ba60ca56b80e565636e0c404e60": crossCurveAlert([CrossCurveLabel.mint('0x440bcab62d629ba60ca56b80e565636e0c404e60'), CrossCurveLabel.redeem('0x440bcab62d629ba60ca56b80e565636e0c404e60'), CrossCurveLabel.swap(7, '0xaf88d065e77c8cc2239327c5edb3a432268e5831', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsArbitrum
      "0xd9bf67d8a5d698a028160f62480d456801f0b4b1": crossCurveAlert([CrossCurveLabel.mint('0xd9bf67d8a5d698a028160f62480d456801f0b4b1'), CrossCurveLabel.redeem('0xd9bf67d8a5d698a028160f62480d456801f0b4b1'), CrossCurveLabel.swap(19, '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsOptimism
      "0x435a160ef111ad0aa0867bece7b85cb77dce3c8a": crossCurveAlert([CrossCurveLabel.mint('0x435a160ef111ad0aa0867bece7b85cb77dce3c8a'), CrossCurveLabel.redeem('0x435a160ef111ad0aa0867bece7b85cb77dce3c8a'), CrossCurveLabel.swap(21, '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsBase
      "0x90135d7300c690d786fa8fea071cd4c2ed080d16": crossCurveAlert([CrossCurveLabel.mint('0x90135d7300c690d786fa8fea071cd4c2ed080d16'), CrossCurveLabel.redeem('0x90135d7300c690d786fa8fea071cd4c2ed080d16'), CrossCurveLabel.swap(31, '0x4300000000000000000000000000000000000003', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsBlast
      "0x20c2e44bbbea698da4a4cb687514e66385996639": crossCurveAlert([CrossCurveLabel.mint('0x20c2e44bbbea698da4a4cb687514e66385996639'), CrossCurveLabel.redeem('0x20c2e44bbbea698da4a4cb687514e66385996639'), CrossCurveLabel.swap(27, '0x4ecaba5870353805a9f068101a40e0f32ed605c6', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsGnosis
      "0xedcf9ef9b389a8f52e81958d8212faf6fbd758ae": crossCurveAlert([CrossCurveLabel.mint('0xedcf9ef9b389a8f52e81958d8212faf6fbd758ae'), CrossCurveLabel.redeem('0xedcf9ef9b389a8f52e81958d8212faf6fbd758ae'), CrossCurveLabel.swap(43, '0x07d83526730c7438048d55a4fc0b850e2aab6f0b', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsTaiko
      "0x6988d6eec3ca7d24c0358bab8018787117325c2b": crossCurveAlert([CrossCurveLabel.mint('0x6988d6eec3ca7d24c0358bab8018787117325c2b'), CrossCurveLabel.redeem('0x6988d6eec3ca7d24c0358bab8018787117325c2b'), CrossCurveLabel.swap(33, '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsMantle
      "0x9e63e5d31fd0136290ef99b3cac4515f346fef1c": crossCurveAlert([CrossCurveLabel.mint('0x9e63e5d31fd0136290ef99b3cac4515f346fef1c'), CrossCurveLabel.redeem('0x9e63e5d31fd0136290ef99b3cac4515f346fef1c'), CrossCurveLabel.swap(39, '0x176211869ca2b568f2a7d4ee941e073a821ee1ff', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsLinea
      "0x2b0911095350785fb32a557d1d2e3b36a9bb9252": crossCurveAlert([CrossCurveLabel.mint('0x2b0911095350785fb32a557d1d2e3b36a9bb9252'), CrossCurveLabel.redeem('0x2b0911095350785fb32a557d1d2e3b36a9bb9252'), CrossCurveLabel.swap(37, '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsCelo
      "0xaa186960df95495084ef1ddc40a3bdac22b0d343": crossCurveAlert([CrossCurveLabel.mint('0xaa186960df95495084ef1ddc40a3bdac22b0d343'), CrossCurveLabel.redeem('0xaa186960df95495084ef1ddc40a3bdac22b0d343'), CrossCurveLabel.swap(49, '0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsMetis
      "0xb7bb92ff0ec68e6d79a238174e42c12ff5ef2b00": crossCurveAlert([CrossCurveLabel.mint('0xb7bb92ff0ec68e6d79a238174e42c12ff5ef2b00'), CrossCurveLabel.redeem('0xb7bb92ff0ec68e6d79a238174e42c12ff5ef2b00'), CrossCurveLabel.swap(51, '0xd988097fb8612cc24eec14542bc03424c656005f', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsMode
      "0x024cc841cd7fe4e7dd7253676c688146599923cf": crossCurveAlert([CrossCurveLabel.mint('0x024cc841cd7fe4e7dd7253676c688146599923cf'), CrossCurveLabel.redeem('0x024cc841cd7fe4e7dd7253676c688146599923cf'), CrossCurveLabel.swap(41, '0xf417f5a458ec102b90352f697d6e2ac3a3d2851f', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsManta
      "0x2e97cf8da26ce3858950dd85b8f69e39ebd251f5": crossCurveAlert([CrossCurveLabel.mint('0x2e97cf8da26ce3858950dd85b8f69e39ebd251f5'), CrossCurveLabel.redeem('0x2e97cf8da26ce3858950dd85b8f69e39ebd251f5'), CrossCurveLabel.swap(47, '0x919c1c267bc06a7039e03fcc2ef738525769109c', 53, '0xf1232a1ab5661abdd6e02c6d8ac9940a23bb0b84')]), // CrossCurve xsKava
      "0x24479a0d48849781b4386ed91fdd84241673ab1e": crossCurveAlert([CrossCurveLabel.mint('0x24479a0d48849781b4386ed91fdd84241673ab1e'), CrossCurveLabel.redeem('0x24479a0d48849781b4386ed91fdd84241673ab1e'), CrossCurveLabel.swap(13, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeEthereum
      "0x9ccaabd2610d467b1f76c8aacec4f567ec61d78e": crossCurveAlert([CrossCurveLabel.mint('0x9ccaabd2610d467b1f76c8aacec4f567ec61d78e'), CrossCurveLabel.redeem('0x9ccaabd2610d467b1f76c8aacec4f567ec61d78e'), CrossCurveLabel.swap(7, '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeArbitrum
      "0x424757a5169e1f3b45436c9b2e5421dc39dc4897": crossCurveAlert([CrossCurveLabel.mint('0x424757a5169e1f3b45436c9b2e5421dc39dc4897'), CrossCurveLabel.redeem('0x424757a5169e1f3b45436c9b2e5421dc39dc4897'), CrossCurveLabel.swap(19, '0x4200000000000000000000000000000000000006', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeOptimism
      "0xa5a5da9c386855b199b8928cbb59c7ac6505ba89": crossCurveAlert([CrossCurveLabel.mint('0xa5a5da9c386855b199b8928cbb59c7ac6505ba89'), CrossCurveLabel.redeem('0xa5a5da9c386855b199b8928cbb59c7ac6505ba89'), CrossCurveLabel.swap(21, '0x4200000000000000000000000000000000000006', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeBase
      "0x6f6522261f89d988d5f5caa5e4e658344517b114": crossCurveAlert([CrossCurveLabel.mint('0x6f6522261f89d988d5f5caa5e4e658344517b114'), CrossCurveLabel.redeem('0x6f6522261f89d988d5f5caa5e4e658344517b114'), CrossCurveLabel.swap(31, '0x4300000000000000000000000000000000000004', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeBlast
      "0x13882f7f207329db487ce99839c26392a233d97b": crossCurveAlert([CrossCurveLabel.mint('0x13882f7f207329db487ce99839c26392a233d97b'), CrossCurveLabel.redeem('0x13882f7f207329db487ce99839c26392a233d97b'), CrossCurveLabel.swap(33, '0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeMantle
      "0xeb427d3cc29ec4c49e48fccc580b11f15d7d096d": crossCurveAlert([CrossCurveLabel.mint('0xeb427d3cc29ec4c49e48fccc580b11f15d7d096d'), CrossCurveLabel.redeem('0xeb427d3cc29ec4c49e48fccc580b11f15d7d096d'), CrossCurveLabel.swap(1, '0x2170ed0880ac9a755fd29b2688956bd959f933f8', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeBSC
      "0xdbb986d7fef61260c7f9a443e62e8a91974c5e3d": crossCurveAlert([CrossCurveLabel.mint('0xdbb986d7fef61260c7f9a443e62e8a91974c5e3d'), CrossCurveLabel.redeem('0xdbb986d7fef61260c7f9a443e62e8a91974c5e3d'), CrossCurveLabel.swap(3, '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xePolygon
      "0xa4948da3f2007193dd7404278fed15d48c617417": crossCurveAlert([CrossCurveLabel.mint('0xa4948da3f2007193dd7404278fed15d48c617417'), CrossCurveLabel.redeem('0xa4948da3f2007193dd7404278fed15d48c617417'), CrossCurveLabel.swap(9, '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeAvalanche
      "0x8bb9b3e45fa6b4bf4bbb66ad09f485c5509a0e4c": crossCurveAlert([CrossCurveLabel.mint('0x8bb9b3e45fa6b4bf4bbb66ad09f485c5509a0e4c'), CrossCurveLabel.redeem('0x8bb9b3e45fa6b4bf4bbb66ad09f485c5509a0e4c'), CrossCurveLabel.swap(27, '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeGnosis
      "0x601538c805ea9d83a49c132f18417db9666f69d5": crossCurveAlert([CrossCurveLabel.mint('0x601538c805ea9d83a49c132f18417db9666f69d5'), CrossCurveLabel.redeem('0x601538c805ea9d83a49c132f18417db9666f69d5'), CrossCurveLabel.swap(49, '0x420000000000000000000000000000000000000a', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeMetis
      "0x759a32b417bb471da76cf41ca2ea42f4e0b143eb": crossCurveAlert([CrossCurveLabel.mint('0x759a32b417bb471da76cf41ca2ea42f4e0b143eb'), CrossCurveLabel.redeem('0x759a32b417bb471da76cf41ca2ea42f4e0b143eb'), CrossCurveLabel.swap(51, '0x4200000000000000000000000000000000000006', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeMode
      "0xe5a0813a7de6abd8599594e84cb23e4a6d9d9800": crossCurveAlert([CrossCurveLabel.mint('0xe5a0813a7de6abd8599594e84cb23e4a6d9d9800'), CrossCurveLabel.redeem('0xe5a0813a7de6abd8599594e84cb23e4a6d9d9800'), CrossCurveLabel.swap(39, '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeLinea
      "0x6d9f0ff2b7f1397ee731f6370d8e4699ffad7bc5": crossCurveAlert([CrossCurveLabel.mint('0x6d9f0ff2b7f1397ee731f6370d8e4699ffad7bc5'), CrossCurveLabel.redeem('0x6d9f0ff2b7f1397ee731f6370d8e4699ffad7bc5'), CrossCurveLabel.swap(43, '0xa51894664a773981c6c112c43ce576f315d5b1b6', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeTaiko
      "0x1008358eecb59723391fba0f8a6b36c5346dab2d": crossCurveAlert([CrossCurveLabel.mint('0x1008358eecb59723391fba0f8a6b36c5346dab2d'), CrossCurveLabel.redeem('0x1008358eecb59723391fba0f8a6b36c5346dab2d'), CrossCurveLabel.swap(41, '0x0dc808adce2099a9f62aa87d9670745aba741746', 13, '0x346704605c72d9f5f9f02d651e5a3dcce6964f3d')]), // CrossCurve xeManta
      "0x09679c768d17b52bfa059010475f9a0bdb0d6fea": crossCurveAlert([CrossCurveLabel.mint('0x09679c768d17b52bfa059010475f9a0bdb0d6fea'), CrossCurveLabel.redeem('0x09679c768d17b52bfa059010475f9a0bdb0d6fea'), CrossCurveLabel.swap(13, '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', 13, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbEthereum
      "0x1c404afffba0e70426dc601aeaa6205eca8c9078": crossCurveAlert([CrossCurveLabel.mint('0x1c404afffba0e70426dc601aeaa6205eca8c9078'), CrossCurveLabel.redeem('0x1c404afffba0e70426dc601aeaa6205eca8c9078'), CrossCurveLabel.swap(7, '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', 13, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbArbitrum
      "0x7b823067ece11047f83f48647110e7a777e2bf5a": crossCurveAlert([CrossCurveLabel.mint('0x7b823067ece11047f83f48647110e7a777e2bf5a'), CrossCurveLabel.redeem('0x7b823067ece11047f83f48647110e7a777e2bf5a'), CrossCurveLabel.swap(19, '0x68f180fcce6836688e9084f035309e29bf0a2095', 13, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbOptimism
      "0x538a5534543752d5abbc8cd11760f8be3625e7b1": crossCurveAlert([CrossCurveLabel.mint('0x538a5534543752d5abbc8cd11760f8be3625e7b1'), CrossCurveLabel.redeem('0x538a5534543752d5abbc8cd11760f8be3625e7b1'), CrossCurveLabel.swap(9, '0x152b9d0fdc40c096757f570a51e494bd4b943e50', 13, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbAvalanche
      "0xdb0a43327626c0e3e87ce936bc0cdf2ee9475c22": crossCurveAlert([CrossCurveLabel.mint('0xdb0a43327626c0e3e87ce936bc0cdf2ee9475c22'), CrossCurveLabel.redeem('0xdb0a43327626c0e3e87ce936bc0cdf2ee9475c22'), CrossCurveLabel.swap(3, '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', 13, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbPolygon
      "0x5fa5168497db4ec1964b3208c18cb6157e5652e4": crossCurveAlert([CrossCurveLabel.mint('0x5fa5168497db4ec1964b3208c18cb6157e5652e4'), CrossCurveLabel.redeem('0x5fa5168497db4ec1964b3208c18cb6157e5652e4'), CrossCurveLabel.swap(1, '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', 13, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbBSC
      "0x1894a7203faa464f7afa3b8c319a3cac8beb6cda": crossCurveAlert([CrossCurveLabel.mint('0x1894a7203faa464f7afa3b8c319a3cac8beb6cda'), CrossCurveLabel.redeem('0x1894a7203faa464f7afa3b8c319a3cac8beb6cda'), CrossCurveLabel.swap(21, '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', 13, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbBase
      "0xee05755051e8b1ccf85747a83d0ef8b00f161180": crossCurveAlert([CrossCurveLabel.mint('0xee05755051e8b1ccf85747a83d0ef8b00f161180'), CrossCurveLabel.redeem('0xee05755051e8b1ccf85747a83d0ef8b00f161180'), CrossCurveLabel.swap(39, '0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4', 13, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbLinea
      "0x9b78e02ddddda4117ddf6be8a0fbd15c45907895": crossCurveAlert([CrossCurveLabel.mint('0x9b78e02ddddda4117ddf6be8a0fbd15c45907895'), CrossCurveLabel.redeem('0x9b78e02ddddda4117ddf6be8a0fbd15c45907895'), CrossCurveLabel.swap(27, '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252', 13, '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd')]), // CrossCurve xbGnosis
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
