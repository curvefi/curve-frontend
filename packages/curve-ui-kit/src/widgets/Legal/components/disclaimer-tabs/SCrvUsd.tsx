import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { CRVUSD_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { pushSearchParams } from '@ui-kit/utils/urls'
import type { TabProps } from '../../types/tabs'
import { List } from '../general/List'
import { Header, Paragraph, Section } from '../general/Section'
import { LegalIntro } from './LegalIntro'

const { Spacing } = SizesAndSpaces

export const SCrvUsd = ({ currentApp, network }: TabProps) => (
  <>
    <Section>
      <LegalIntro currentApp={currentApp} network={network} />

      <Paragraph>{t`scrvUSD is an ERC4626 compliant vault that allows crvUSD holders to earn yield from protocol revenue. Deposits are not rehypothecated, can be readily redeemed for the underlying crvUSD at any time, and are non-transferrable except for the purpose of user-initiated redemption.`}</Paragraph>
      <Paragraph>{t`There are, nonetheless, design mechanisms that introduce risks and trust assumptions. Users should familiarize themselves with these before interacting with scrvUSD.`}</Paragraph>
    </Section>

    <Stack
      direction={{
        mobile: 'column',
        tablet: 'row',
      }}
      gap={Spacing.md}
      sx={{ marginInline: Spacing.md }}
    >
      <ExternalLink href="https://docs.curve.finance/scrvusd/overview/" label={t`scrvUSD protocol docs`} />
      <ExternalLink
        href="https://docs.curve.finance/assets/pdf/ChainSecurity_Curve_scrvUSD_audit.pdf"
        label={t`scrvUSD smart contract audits`}
      />
    </Stack>

    <Header>{t`crvUSD Dependency`}</Header>
    <Section>
      <Paragraph>{t`As scrvUSD is directly tied to crvUSD, it inherits all risks associated with the underlying token. Users should consider the potential for cascading impacts from issues affecting crvUSD mint markets, including but not limited to:`}</Paragraph>

      <Paragraph>
        <List type="disc">
          <Box component="li">
            <Typography variant="bodyMBold" component="span">
              {t`Technical Risk`}
              {': '}
            </Typography>

            <Typography variant="bodyMRegular" component="span">
              {t`crvUSD is a permissionless stablecoin composed of many inter-related smart contracts that enable functionality such as minting from various collaterals, peg stability mechanisms, and liquidations processing. scrvUSD inherits all technical risks associated with the crvUSD protocol.`}
            </Typography>
          </Box>

          <Box component="li">
            <Typography variant="bodyMBold" component="span">
              {t`Collateral Dependency`}
              {': '}
            </Typography>

            <Typography variant="bodyMRegular" component="span">
              {t`crvUSD is overcollateralized by an assortment of crypto assets whitelisted by the Curve DAO. Many collateral types are pegged assets that depend on an issuer or protocol to maintain their own stability. Problems associated with the underlying collateral may impact crvUSD's solvency.`}
            </Typography>
          </Box>

          <Box component="li">
            <Typography variant="bodyMBold" component="span">
              <Link color="textSecondary" href="https://docs.curve.finance/crvUSD/pegkeepers/overview/" target="_blank">
                {t`PegKeeper Dependency:`}
              </Link>
              {': '}
            </Typography>

            <Typography variant="bodyMRegular" component="span">
              {t`crvUSD maintains a soft peg to USD that is reinforced by programmatic mint/burn actions into designated PegKeeper pools. This creates a dependency on the stability of third party stablecoins (e.g. USDT and USDC), which can impact crvUSD's stability by proxy.`}
            </Typography>
          </Box>

          <Box component="li">
            <Typography variant="bodyMBold" component="span">
              {t`Governance Risk`}
              {': '}
            </Typography>

            <Typography variant="bodyMRegular" component="span">
              {t`The Curve DAO can modify code and change parameters within the crvUSD protocol. It is possible that bugs or malicious modifications are introduced to the protocol through governance actions.`}
            </Typography>
          </Box>
        </List>
      </Paragraph>

      <Paragraph>
        {t`Read the`}{' '}
        <RouterLink
          color="textSecondary"
          href={getInternalUrl('crvusd', 'ethereum', CRVUSD_ROUTES.PAGE_LEGAL)}
          onClick={(e) => pushSearchParams(e, { tab: 'disclaimers', subtab: 'crvusd' })}
          target="_blank"
        >
          {t`crvUSD Risk Disclaimer`}
        </RouterLink>{' '}
        {t`for a more detailed overview of risks related to crvUSD.`}
      </Paragraph>
    </Section>

    <Header>{t`Vault Smart Contract Risks`}</Header>
    <Section>
      <Paragraph>
        {t`To obtain scrvUSD, users deposit crvUSD into a Savings Vault which make use of`}{' '}
        <Link color="textSecondary" href="https://docs.yearn.fi/developers/v3/overview" target="_blank">
          {t`Yearn V3 vaults`}
        </Link>
        {'. '}
        {t`While Yearn vaults have undergone extensive`}{' '}
        <Link color="textSecondary" href="https://github.com/yearn/yearn-vaults-v3/tree/master/audits" target="_blank">
          {t`audits`}
        </Link>{' '}
        {t`and demonstrated resilience and security, users should be aware of the technical risks associated with interacting with smart contracts.`}
      </Paragraph>

      <Paragraph>{t`The vault may have undiscovered smart contract vulnerabilities, even in audited contracts. Flaws in the vault’s critical functions or underlying code could lead to unexpected or incorrect contract behavior, potentially resulting in financial losses or interruptions in the vault’s operations. A non-exhaustive list of technical failures may include:`}</Paragraph>

      <Paragraph>
        <List type="disc">
          <Box component="li">
            <Typography variant="bodyMBold" component="span">
              {t`Inflation Attacks`}
              {': '}
            </Typography>

            <Typography variant="bodyMRegular" component="span">
              {t`An attacker could exploit weaknesses in the vault’s share issuance mechanism, enabling them to mint more shares than they are legitimately entitled to, leading to dilution of other users’ holdings.`}
            </Typography>
          </Box>

          <Box component="li">
            <Typography variant="bodyMBold" component="span">
              {t`Reentrancy Attacks`}
              {': '}
            </Typography>

            <Typography variant="bodyMRegular" component="span">
              {t`Malicious actors could exploit reentrancy vulnerabilities by manipulating functions that interact with external contracts, such as token transfers or protocol integrations, potentially causing unexpected fund transfers or protocol malfunctions.`}
            </Typography>
          </Box>
        </List>
      </Paragraph>

      <Paragraph>{t`In case of an emergency, a privileged role can be assigned to call shutdown_vault() and prevent additional deposits to the vault. This is an irreversible action. Existing vault depositors are still able to withdraw from the vault in an emergency shutdown event, and are responsible for doing so to mitigate the risk of funds loss. This role and other vault roles are assigned by the Curve DAO, which requires an on-chain vote and 7 day timelock to enact any change.`}</Paragraph>
    </Section>

    <Header>{t`Interest Accrual Risks`}</Header>
    <Section>
      <Paragraph>{t`The interest accrued to scrvUSD originates from crvUSD interest rate fees paid by borrowers taking out crvUSD loans. Interest on scrvUSD accrues passively and is designed to increase the underlying value of scrvUSD over time.`}</Paragraph>
      <Paragraph>{t`Users should recognize that the value increase is not guaranteed, nor does Curve guarantee a specific APY. The yield realized by holders depends on multiple factors. For example:`}</Paragraph>

      <Paragraph>
        <List type="disc">
          <Box component="li">
            <Typography variant="bodyMBold" component="span">
              {t`Revenue Dependency`}
              {': '}
            </Typography>

            <Typography variant="bodyMRegular" component="span">
              {t`The proportion of revenue allocated to scrvUSD holders depends on the total crvUSD fees generated, which may fluctuate due to borrower demand, fee structure changes, or market conditions. A decline in borrower activity or revenue could reduce the interest accrued for scrvUSD holders.`}
            </Typography>
          </Box>

          <Box component="li">
            <Typography variant="bodyMBold" component="span">
              {t`Dynamic Proportion`}
              {': '}
            </Typography>

            <Typography variant="bodyMRegular" component="span">
              {t`Realized yield is dynamic and depends on the share of the vault owned relative to the total revenue being distributed. Users should understand that variations in this ratio may directly affect their earned interest, leading to outcomes that differ from initial expectations. Factors such as global stablecoin yields and the risk premium of crvUSD exposure may cause fluctuations.`}
            </Typography>
          </Box>

          <Box component="li">
            <Typography variant="bodyMBold" component="span">
              {t`Rewards Rate Parameters`}
              {': '}
            </Typography>

            <Typography variant="bodyMRegular" component="span">
              {t`Privileged addresses control parameters that determine the rewards distribution rate. This role is controlled by the Curve DAO, requiring an on-chain vote and 7 day timelock to enact any change. The DAO may also appoint a third party to control the distribution.`}
            </Typography>
          </Box>

          <Box component="li">
            <Typography variant="bodyMBold" component="span">
              {t`Rewards Proportion Parameters`}
              {': '}
            </Typography>

            <Typography variant="bodyMRegular" component="span">
              {t`The owner of the Fee Splitter contract controls the max revenue share to scrvUSD, controlling the upper and lower bound of the scrvUSD yield allocation (e.g. allocating between 20% and 30% of the crvUSD yield). This role is controlled by the Curve DAO, requiring an on-chain vote and 7 day timelock to enact any change. The DAO may also appoint a third party to control the distribution.`}
            </Typography>
          </Box>
        </List>
      </Paragraph>
    </Section>

    <Header>{t`MEV and Revenue Distribution Risks`}</Header>
    <Section>
      <Paragraph>{t`The accuracy of scrvUSD supply calculations is crucial for the proper distribution of protocol revenue among holders. Users should be aware that supply calculations may be subject to manipulation through MEV (Maximal Extractable Value) strategies, which could affect revenue distribution and, consequently, the actual yields received by scrvUSD holders. This can lead to discrepancies between expected and actually received yields for users. From a practical standpoint, when evaluating potential scrvUSD yields, users should consider that published APYs may differ from actual returns due to these factors.`}</Paragraph>
      <Paragraph>{t`scrvUSD accounts for MEV risk by incorporating protections that calculate a Time Weighted Average (TWA) of the ratio between deposited crvUSD in the Vault and total circulating supply of crvUSD. The TWA is meant to prevent MEV manipulation of the yield distribution rate. Misconfiguration of the TWA can allow MEV actions to become profitable. Any manipulation gain or loss is shared with all the other vault depositors until a new non-manipulated snapshot is taken.`}</Paragraph>
    </Section>

    <Header>{t`Cross-chain scrvUSD Risks`}</Header>
    <Section>
      <Paragraph>{t`While scrvUSD can be bridged, cross-chain representations lack the method to return its continuously updating price. Therefore cross-chain scrvUSD incorporates a series of additional contracts that provide and validate Ethereum block hashes, using those to calculate and store the current rate.`}</Paragraph>
      <Paragraph>{t`There are operational requirements to reliably transmit the rate data, including to apply and prove block hashes. While these actions are permissionless, they may not be closely monitored or reliably executed. Assuming that cross-chain contracts are bug free, execution is programmatic and therefore safe; this point regarding monitoring is rather a liveness concern.`}</Paragraph>
      <Paragraph>{t`Furthermore, there is a trust assumption in the owner of the scrvUSD oracle which can update the prover address and rate limiting parameters. Due to these factors, the scrvUSD rate on chains other than mainnet may not accurately reflect the actual rate, either temporarily or permanently.`}</Paragraph>
    </Section>

    <Header>{t`Secondary Market Risks`}</Header>
    <Section>
      <Paragraph>{t`scrvUSD can also be acquired on secondary markets outside of the primary access venue (and cross-chain scrvUSD is only available on secondary markets). As a consequence of certain market scenarios, scrvUSD may trade at a discount to its underlying crvUSD value. Users who sell scrvUSD at such a discounted price will realize losses relative to its intrinsic value. Secondary market dynamics are subject to external factors, including market sentiment, trading volume, and liquidity conditions, which may amplify these risks.`}</Paragraph>
      <Paragraph>{t`As scrvUSD is always readily redeemable for crvUSD directly from the vault contract, aside from a technical failure, users should never be required to swap at unfavorable rates on secondary markets. Situations may occur that DEX aggregators fail to route trades optimally, so users should always check that their aggregator service is quoting sensible exchange rates. Furthermore, being able to redeem crvUSD from an L2 requires the user to be able to bridge back to mainnet. Redemptions of cross-chain scrvUSD may incur additional gas costs and dependence on bridge availability.`}</Paragraph>
    </Section>
  </>
)
