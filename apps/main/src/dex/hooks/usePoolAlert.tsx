import { useMemo } from 'react'
import { ROUTE } from '@/dex/constants'
import { PoolAlert, PoolData, PoolDataCache, type UrlParams } from '@/dex/types/main.types'
import { useParams } from '@ui-kit/hooks/router'
import { t, Trans } from '@ui-kit/lib/i18n'
import { getInternalUrl } from '@ui-kit/shared/routes'
import { InlineLink } from '@ui-kit/shared/ui/InlineLink'
import { PoolAlertMessage } from '../components/pool-alert-messages'

export const usePoolAlert = (poolData?: PoolData | PoolDataCache) => {
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
      banner: {
        title: t`zStables Attack`,
        subtitle: t`zStables (zETH, UZD) have encountered an attack. `,
        learnMoreUrl: 'https://twitter.com/ZunamiProtocol/status/1690863406079696896?s=20',
      },
      /* TODO: use Typography component instead of p tag */
      message: (
        <PoolAlertMessage>
          <p>{t`Deposit disabled.`}</p>
        </PoolAlertMessage>
      ),
    })
    const geistFinanceAlert = (): PoolAlert => ({
      alertType: 'warning',
      isDisableDeposit: true,
      isDisableSwap: true,
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      banner: {
        title: t`Geist Finance Disabled`,
        subtitle: t`Deposit and swap are disabled.`,
        learnMoreUrl: 'https://twitter.com/geistfinance',
      },
      message: (
        <PoolAlertMessage>
          <p>{t`This pool is in withdraw only mode.`}</p>
        </PoolAlertMessage>
      ),
    })
    const yPrismaAlert = (): PoolAlert => {
      const prismaPoolHref = getInternalUrl(
        'dex',
        params.network,
        `${ROUTE.PAGE_POOLS}/factory-v2-372${ROUTE.PAGE_POOL_DEPOSIT}`,
      )
      return {
        isDisableDeposit: true,
        isInformationOnly: true,
        isCloseOnTooltipOnly: true,
        alertType: 'warning',
        message: (
          <PoolAlertMessage>
            <p>{t`Deposit disabled.`}</p>
          </PoolAlertMessage>
        ),
        banner: {
          title: t`Deprecated Pool`,
          subtitle: (
            <Trans>
              This pool has been deprecated. Please use the <InlineLink to={prismaPoolHref}>PRISMA/yPRISMA</InlineLink>{' '}
              pool instead.
            </Trans>
          ),
        },
      }
    }
    const synthetixAlert = (): PoolAlert => ({
      alertType: 'warning',
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      minWidth: '350px',
      banner: {
        title: t`Synthetix Synths Disabled`,
        subtitle: t`Exchanges on Synthetix synths are expected to be disabled. Users should withdraw liquidity or redeem synths to sUSD. Exit pools to avoid value dilution.`,
        learnMoreUrl: 'https://gov.curve.finance/t/kill-gauges-on-all-non-susd-curve-pools-on-ethereum/10033/2',
      },
      message: (
        <PoolAlertMessage>
          <p>
            <Trans>
              Please note that exchanges on synthetix synths are expected to be disabled and users can either withdraw
              liquidity from the underlying token, or redeem their synths to sUSD on{' '}
              <InlineLink to="https://staking.synthetix.io/wallet/balances/">synthetix.io</InlineLink>
            </Trans>
          </p>
          <p>
            <Trans>
              Users are encouraged to exit the pools in order to avoid getting their holdings&lsquo; value diluted with
              the discountRate For more information please refer to{' '}
              <InlineLink to="https://gov.curve.finance/t/kill-gauges-on-all-non-susd-curve-pools-on-ethereum/10033/2">
                gov.curve.finance
              </InlineLink>
            </Trans>
          </p>
          <p>
            <Trans>
              Please note that sUSD is not involved, so these would be on the other pools sETH, sBTC, sForex ...
            </Trans>
          </p>
        </PoolAlertMessage>
      ),
    })
    const ironbankAlert = (): PoolAlert => ({
      alertType: 'warning',
      isInformationOnlyAndShowInForm: true,
      isDisableDeposit: true,
      banner: {
        title: t`Ironbank Protocol Deprecated`,
        subtitle: t`The Ironbank protocol is deprecated. Please do not supply liquidity to this pool.`,
      },
      message: (
        <PoolAlertMessage>
          <p>{t`Deposit disabled.`}</p>
        </PoolAlertMessage>
      ),
    })
    const synthetixUsdAlert = (): PoolAlert => ({
      alertType: 'danger',
      isDisableDeposit: true,
      isDisableSwap: true,
      isDisableWithdrawOnly: true,
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      banner: {
        title: t`Synthetix USD Deprecated`,
        subtitle: t`Pool is deprecated. Deposit, swap and withdraw are disabled.`,
        learnMoreUrl: 'https://x.com/synthetix_io/status/1953054538610688198',
      },
      message: (
        <PoolAlertMessage>
          <p>{t`This pool is disabled. You can still claim your rewards.`}</p>
        </PoolAlertMessage>
      ),
    })
    const yieldbasisAlert = (): PoolAlert => ({
      alertType: 'warning',
      isDisableDeposit: true,
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      banner: {
        title: t`YieldBasis Managed Pool`,
        subtitle: (
          <Trans>
            This pool is managed by <b>YieldBasis</b>. Only deposits made on the YieldBasis UI earn fees and rewards.
          </Trans>
        ),
        learnMoreUrl: 'https://yieldbasis.com',
      },
      message: (
        <PoolAlertMessage>
          <p>
            <Trans>
              Deposit on <InlineLink to="https://yieldbasis.com">yieldbasis.com</InlineLink>
            </Trans>
          </p>
        </PoolAlertMessage>
      ),
    })

    const uspdioAlert = (): PoolAlert => ({
      alertType: 'danger',
      isDisableDeposit: true,
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      banner: {
        title: t`USPD Exploited`,
        subtitle: t`USPD has been exploited. This pool has been disabled to prevent new users from loss of funds.`,
      },
      message: (
        <PoolAlertMessage>
          <p>{t`Deposit disabled. We recommend exiting this pool.`}</p>
        </PoolAlertMessage>
      ),
    })

    // Avalanche
    const atricryptoAlert = (): PoolAlert => ({
      alertType: 'info',
      isCloseOnTooltipOnly: true,
      isInformationOnlyAndShowInForm: true,
      message: (
        <PoolAlertMessage>
          <p>
            <Trans>
              Deposit and Swap with wBTC.e will return an error due to an Aave community decision to freeze this asset.{' '}
              <InlineLink to="https://app.aave.com/governance/v3/proposal/?proposalId=2">More details</InlineLink>
            </Trans>
          </p>
        </PoolAlertMessage>
      ),
    })

    // all networks
    const vyperExploitedAlert = (): PoolAlert => ({
      alertType: 'danger',
      isDisableDeposit: true,
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      banner: {
        title: t`Vyper Vulnerability Exploit`,
        subtitle: t`This pool has been exploited due to a vulnerability found in Vyper versions v0.2.15, v0.2.16, or v0.3.0.`,
        learnMoreUrl: 'https://hackmd.io/@LlamaRisk/BJzSKHNjn',
      },
      message: (
        <PoolAlertMessage>
          <p>{t`Deposit disabled. We recommend exiting this pool.`}</p>
        </PoolAlertMessage>
      ),
    })

    const possibleVyperExploitedAlert = (): PoolAlert => ({
      alertType: 'danger',
      isDisableDeposit: true,
      isInformationOnly: true,
      isCloseOnTooltipOnly: true,
      banner: {
        title: t`Potential Vulnerability Exploit`,
        subtitle: t`This pool might be at risk of being exploited. We recommend exiting this pool.`,
        learnMoreUrl: 'https://twitter.com/CurveFinance/status/1685925429041917952',
      },
      message: (
        <PoolAlertMessage>
          <p>{t`Deposit disabled. We recommend exiting this pool.`}</p>
        </PoolAlertMessage>
      ),
    })

    // Pool creator configured a price feed instead of redemption rates for stored_rates, leading to users losing funds when swapping.
    const monadEthConverterAlert = (): PoolAlert => ({
      alertType: 'danger',
      isDisableDeposit: true,
      isDisableSwap: true,
      isInformationOnly: true,
      isInformationOnlyAndShowInForm: true,
      isCloseOnTooltipOnly: true,
      banner: {
        title: t`Misconfigured Pool`,
        subtitle: t`This pool has been misconfigured. It has been set to withdraw only. To minimize impact withdraw in balanced proportion instead of single sided.`,
      },
      message: (
        <PoolAlertMessage>
          <p>{t`This pool is in withdraw only mode.`}</p>
        </PoolAlertMessage>
      ),
    })

    // Pool creator configured bad price oracles, leading to users losing funds.
    const misconfiguredPoolsAlert = (): PoolAlert => ({
      alertType: 'danger',
      isDisableDeposit: true,
      isDisableSwap: true,
      isInformationOnly: true,
      isInformationOnlyAndShowInForm: true,
      isCloseOnTooltipOnly: true,
      banner: {
        title: t`Misconfigured Pool`,
        subtitle: t`This pool has been misconfigured. It has been set to withdraw only.`,
      },
      message: (
        <PoolAlertMessage>
          <p>{t`This pool is in withdraw only mode.`}</p>
        </PoolAlertMessage>
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
      '0x83f24023d15d835a213df24fd309c47dab5beb32': yieldbasisAlert(),
      '0xf1f435b05d255a5dbde37333c0f61da6f69c6127': yieldbasisAlert(),
      '0xd9ff8396554a0d18b2cfbec53e1979b7ecce8373': yieldbasisAlert(),
      '0x6e5492f8ea2370844ee098a56dd88e1717e4a9c2': yieldbasisAlert(),
      '0x06cf5f9b93e9fcfdb33d6b3791eb152567cd8d36': uspdioAlert(),

      // arbitrum
      '0x960ea3e3c7fb317332d990873d354e18d7645590': possibleVyperExploitedAlert(), // tricrypto
      '0xc55be2dc490578560a030b6ba387aba0fe03cc73': misconfiguredPoolsAlert(),
      '0xc5f069dd8112614673890aa21d8989d5d0db69d8': misconfiguredPoolsAlert(),
      '0x2e6cfeeb00038f6a88a008e8b3c2bbd2f6c6bf9f': misconfiguredPoolsAlert(),
      '0x2b7dcdc718e03749de0a138c56b0e18f9750134b': misconfiguredPoolsAlert(),
      '0x533482d1d126ad8dd1ed925655b717a3425adf39': misconfiguredPoolsAlert(),
      '0xc1005bbafa47f8aeb084646ffd83fd8dada3bb3b': misconfiguredPoolsAlert(),
      '0x8afce00f46938db8e958fa7f8a1f4626c26242b7': misconfiguredPoolsAlert(),
      '0xf9ae77094ae7308debf9ea25aeb3c8ab55714f32': misconfiguredPoolsAlert(),
      '0x172cb45033b5495ca66f6866a01aa87cbad8f560': misconfiguredPoolsAlert(),
      '0x4f4dcb8d373c26cc7db78ad1dc5ffdfcb45f4e55': misconfiguredPoolsAlert(),
      '0x60d7ce16f815ea69e803c8146b8c32c84cc9982b': misconfiguredPoolsAlert(),
      '0x03e9f4a7dcf587a5437f2d0332e35a73ded52d7d': misconfiguredPoolsAlert(),
      '0x14515323e5c48e0ae75ad333e885cf050d0e3d9b': misconfiguredPoolsAlert(),
      '0x11fd5664121e9b464b5e8434aa7d70b8e9146ca6': misconfiguredPoolsAlert(),
      '0x2ff3ba10deb05573d2fae704a962183461d106d8': misconfiguredPoolsAlert(),
      
      // avalanche
      '0xb755b949c126c04e0348dd881a5cf55d424742b2': atricryptoAlert(),

      // polygon
      '0xbeb90d2d165d010706aca022a85a3b2d6a49eaa1': misconfiguredPoolsAlert(),
      '0x810528a5086e997e39e12dccf02bad54a7bbe95b': misconfiguredPoolsAlert(),

      // monad
      '0x2fd13b49f970e8c6d89283056c1c6281214b7eb6': monadEthConverterAlert()
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
