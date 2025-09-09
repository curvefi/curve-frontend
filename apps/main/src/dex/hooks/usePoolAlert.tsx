import { useMemo } from 'react'
import { styled } from 'styled-components'
import { ROUTE } from '@/dex/constants'
import { PoolAlert, PoolData, PoolDataCache, type UrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import Box from '@ui/Box'
import { ExternalLink, InternalLink } from '@ui/Link'
import { breakpoints } from '@ui/utils'
import { useParams } from '@ui-kit/hooks/router'
import { shortenAddress } from '@ui-kit/utils'

const usePoolAlert = (poolData?: PoolData | PoolDataCache) => {
  const params = useParams<UrlParams>()

  const poolAddress = poolData?.pool.address
  const hasVyperVulnerability = poolData?.hasVyperVulnerability

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
