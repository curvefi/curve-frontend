import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TabProps } from '../../types/tabs'
import { List } from '../general/List'
import { Section, Header, Title, Paragraph } from '../general/Section'
import { LegalIntro } from './LegalIntro'

const { Spacing } = SizesAndSpaces

export const CrvUsd = ({ currentApp, network }: TabProps) => (
  <>
    <Section>
      <LegalIntro currentApp={currentApp} network={network} />

      <Paragraph>{t`Curve stablecoin infrastructure enables users to mint crvUSD using a selection of crypto-tokenized collaterals (adding new ones is subject to DAO approval). Interacting with crvUSD doesn't come without risks. Before minting or taking exposure of crvUSD, it is best to research and understand the risks involved.`}</Paragraph>
    </Section>

    <Stack
      direction={{
        mobile: 'column',
        tablet: 'row',
      }}
      gap={Spacing.xs}
      sx={{
        marginInline: Spacing.md,
      }}
    >
      <Button
        component={Link}
        variant="link"
        href="https://docs.curve.finance/assets/pdf/whitepaper_curve_stablecoin.pdf"
        target="_blank"
        endIcon={<ArrowOutwardIcon />}
        sx={{
          padding: Spacing.xs,
          '&': { fontWeight: '500' },
        }}
      >
        {t`crvUSD whitepaper`}
      </Button>

      <Button
        component={Link}
        variant="link"
        href="https://docs.curve.finance/security/security/#stablecoin-and-lending"
        target="_blank"
        endIcon={<ArrowOutwardIcon />}
        sx={{
          padding: Spacing.xs,
          '&': { fontWeight: '500' },
        }}
      >
        {t`crvUSD smart contract audits`}
      </Button>
    </Stack>

    <Header>{t`crvUSD Design Risks`}</Header>
    <Section>
      <Paragraph>{t`crvUSD has unique design features that Users should fully understand before interacting with the protocol.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`Soft-Liquidation and Hard-Liquidation`}</Title>

      <Paragraph>
        {t`Collateralized debt positions are managed passively through arbitrage opportunities: if the collateral's price decreases, the system automatically sells off collateral to arbitrageurs in a ‘soft-liquidation mode’. If the collateral's price increases, the system recovers the collateral. This algorithm is designed to dynamically adjust the collateral backing each crvUSD in real-time, responding to fluctuating market conditions. While this approach is intended to mitigate the severity of traditional liquidations—a process where collateral becomes insufficient, leading to irreversible sales at potentially undervalued prices—it does not eliminate the inherent risk of collateral volatility. Additional information can be found on`}{' '}
        <Link color="textSecondary" href="https://docs.curve.finance/crvUSD/amm/" target="_blank">
          {t`LLAMMA Overview`}
        </Link>
        {'.'}
      </Paragraph>

      <Paragraph>{t`Borrowers in the crvUSD ecosystem are subject to specific risks associated with the liquidation process. It is crucial to understand that if the User’s collateral is placed into soft-liquidation mode, they are prohibited from withdrawing the collateral or augmenting their position with additional collateral. Entering soft-liquidation mode locks the collateral, removing the option to withdraw or add to it. In case market conditions suggest a strategic adjustment to the User’s position, they may face exacerbated risk due to such restrictions.`}</Paragraph>
      <Paragraph>{t`Users should be cautious about collateral management, as a sharp decline in the price of the collateral within a brief period can escalate losses, further deteriorating the health of the loan. Respectively, an increase in the collateral's value while in soft-liquidation can also cause “de-liquidation losses” - a situation where an appreciating market price for the collateral may negatively impact the loan’s health. During periods of high volatility and/or high Ethereum gas prices, arbitrage may be less efficient, causing losses incurred from soft liquidation to be exacerbated.`}</Paragraph>
      <Paragraph>{t`If the health of the loan falls to zero, the position is subject to hard liquidation, which is an irreversible process resulting in the loss of the collateral with no possibility of recovery or de-liquidation. This scenario underscores the critical need for risk management when using leverage. Leverage and collateral management should be approached with caution, reflecting a balanced assessment of potential gains against the risk of significant financial loss.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`Curve Pool EMA Oracles`}</Title>

      <Paragraph>
        {t`Curve incorporates specialized on-chain Exponential Moving Average (EMA) oracles built into stabelswap-ng, tricrypto-ng, and twocrypto-ng Curve pool implementations. crvUSD markets derive price information from a select number of high TVL Curve pools. By utilizing the EMA smoothing methodology, oracles mitigate the impact of transient price fluctuations, aiming to reduce unnecessary losses caused by short-term market volatility or attempts to manipulate the oracle. Despite the manipulation-resistant design specification, Curve pool oracles may exhibit price distortions in certain scenarios that have the potential to result in missed or excessive liquidations. This may be a result of liquidity and volume migration to alternate venues that increase the risk of oracle manipulation. A detailed explanation of the aforementioned terms can be found in the`}{' '}
        <Link color="textSecondary" href="https://docs.curve.finance/crvUSD/oracle/" target="_blank">
          {t`crvUSD Oracle`}
        </Link>{' '}
        {t`documentation`}
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`Pegkeepers`}</Title>
      <Paragraph>{t`crvUSD makes use of Pegkeepers, contracts authorized to deposit and withdraw crvUSD from a whitelisted Curve crvUSD stableswap pool up to a predefined debt cap. These contracts reference a subset of whitelisted stablecoins as a proxy for the intended USD price. Instability affecting any counterparty Pegkeeper assets (e.g. USDT, USDC), which are also used to aggregate a USD price for crvUSD, may cause the Pegkeeper to deposit all of its crvUSD into the pool in an attempt to rebalance. This creates a dependency on the Pegkeeper counterparty assets that determines the stability of the crvUSD peg. An upgraded PegkeeperV2 design promises to alleviate this risk.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`Dynamic Interest Rates`}</Title>
      <Paragraph>
        {t`The borrowing rate is algorithmically determined based on several factors, including:`}
        <List type="disc">
          <Typography component="li" variant="bodyMRegular">
            {t`The crvUSD price as reported by an on-chain price aggregator contract`}
          </Typography>

          <Typography component="li" variant="bodyMRegular">
            {t`The ratio of Pegkeeper debt to total outstanding debt`}
          </Typography>

          <Typography component="li" variant="bodyMRegular">
            {t`Several variables set by the Monetary Policy admin`}
          </Typography>
        </List>
      </Paragraph>

      <Paragraph>
        {t`Essentially, the borrow rate increases when the price of crvUSD goes lower and/or the proportion of Pegkeeper debt to total debt reduces. This process is intended to dynamically regulate market behavior such that it reinforces the crvUSD peg. Changes to the Monetary Policy are authorized only by the Curve DAO. A`}{' '}
        <Link color="textSecondary" href="https://github.com/0xreviews/crvusdsim" target="_blank">
          {t`crvUSD simulation tool`}
        </Link>{' '}
        {t`by 0xReviews allows Users to visualize the influence of these factors on the borrowing rate.`}
      </Paragraph>

      <Paragraph>{t`There may be assumptions in the Monetary Policy design that, in some circumstances, cause interest rates to produce undesired outcomes, and which may cause a sub-optimal experience for borrowers. In general, interest rates on borrowing may change dramatically in response to changing market circumstances, and may not reflect a borrower's expectations when they had opened their position.`}</Paragraph>
    </Section>

    <Header>{t`Market Risks`}</Header>
    <Section>
      <Title>{t`Liquidity Risk`}</Title>
      <Paragraph>{t`Users should be aware that ample crvUSD liquidity on exchange is necessary for facilitating liquidations. Circumstances leading to a reduction in the available crvUSD liquidity for liquidators are plausible. Such scenarios can significantly impact the proper functioning of the stablecoin market, particularly concerning the process of liquidation.`}</Paragraph>
      <Paragraph>{t`crvUSD relies on liquidity concentrated within particular Pegkeeper pools, which serve a dual purpose as both a source of liquidity and price feeds for crvUSD oracles. If the incentives for depositing crvUSD into these pools are insufficient, the liquidity shortfalls can result in missed liquidations or deflationary price spirals (cascading liquidations). This phenomenon occurs when initial liquidations fail to be executed effectively, leading to a domino effect of further liquidations and potentially rapid, significant decreases in asset prices.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`No Guarantee of Price Stability`}</Title>
      <Paragraph>{t`The value of the crypto assets used as collateral for crvUSD is subject to high levels of volatility and unpredictability. The pricing of these assets may be extremely speculative and prone to rapid fluctuations. Such market characteristics can impact the stability of crvUSD’s value. While the LLAMMA algorithm aims to adjust collateral levels to support crvUSD’s value, there is no guarantee that these adjustments will always preserve stability, especially during periods of extreme market volatility.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`Depegging Risk`}</Title>
      <Paragraph>{t`The blockchain ecosystem has witnessed instances where stablecoins experienced significant and prolonged periods of depegging from their intended value. Despite the innovative measures designed to uphold price stability, crvUSD is not exempt from the risk of depegging. Market volatility, shifts in regulatory landscapes, sudden and substantial changes in the value of collateral assets, or unforeseen technical issues can precipitate a departure from its pegged value.`}</Paragraph>
    </Section>

    <Header>{t`Technology Risk`}</Header>
    <Section>
      <Title>{t`Smart Contract Risk`}</Title>
      <Paragraph>{t`crvUSD relies on smart contracts, which are self-executing pieces of code. While these contracts are designed to be secure, there is a risk that they may contain vulnerabilities or bugs. Malicious actors could exploit these vulnerabilities, resulting in the loss of funds or other adverse consequences. Users need to conduct due diligence and review the smart contracts and security audit reports to assess the inherent risks.`}</Paragraph>
      <Paragraph>{t`Curve smart contracts have undergone multiple audits by reputable firms, including MixBytes and ChainSecurity, to enhance protocol security. While smart contract audits play an important role in good security practices to mitigate user risks, they don't eliminate all risks. Users should always exercise caution regardless of Curve's commitment to protocol security.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`No Loss Prevention`}</Title>
      <Paragraph>{t`crvUSD and its underlying infrastructure are in an early stage of development, are inherently experimental, and carry a significant degree of risk. Engagement with crvUSD during this phase should be approached with the understanding that it may lead to partial or complete loss of funds. Such losses may include the total loss of all assets, which in some cases may be permanently unrecoverable. Users considering minting, redeeming, or utilizing crvUSD should be prepared for the possibility of encountering technical issues, bugs, or vulnerabilities that could impact the value of crvUSD or the safety of allocated crypto assets.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`General Blockchain Technology Risks`}</Title>

      <Paragraph>
        {t`Engaging with crypto assets involves exposure to a range of technological risks inherent to the use of new and evolving technologies. Users must be aware of key risk factors (as outlined below) and consider their implications for crypto asset transactions.`}{' '}
      </Paragraph>

      <Paragraph>
        <List type="numeric">
          <Typography component="li" variant="bodyMBold">
            {t`Irreversibility of Transactions`}
            <List type="lower-alpha">
              <Typography component="li" variant="bodyMRegular">
                {t`Once executed, transactions in crypto assets cannot be reversed. Errors or accidental transactions cannot be easily rectified, potentially leading to permanent loss of assets.`}
              </Typography>
            </List>
          </Typography>

          <Typography component="li" variant="bodyMBold">
            {t`Anonymity`}
            <List type="lower-alpha">
              <Typography component="li" variant="bodyMRegular">
                {t`The degree of anonymity provided by blockchain technology can complicate the tracing of funds and the identification of parties in transactions.`}
              </Typography>
            </List>
          </Typography>

          <Typography component="li" variant="bodyMBold">
            {t`Software Dependencies`}
            <List type="lower-alpha">
              <Typography component="li" variant="bodyMRegular">
                {t`Crypto asset operations rely heavily on the flawless functioning of complex software, including wallets, smart contracts, and blockchain networks. Any defects, bugs, or vulnerabilities in software can impair access to or use of crypto assets, leading to potential losses.`}
              </Typography>
            </List>
          </Typography>

          <Typography component="li" variant="bodyMBold">
            {t`Cybersecurity Incidents`}
            <List type="lower-alpha">
              <Typography component="li" variant="bodyMRegular">
                {t`The digital nature of crypto assets makes them a target for hackers, malicious actors, and other cybersecurity threats. Failures, hacks, exploits, protocol errors, and unforeseen vulnerabilities can compromise the security of assets, resulting in theft, loss, or unauthorized access.`}
              </Typography>
            </List>
          </Typography>

          <Typography component="li" variant="bodyMBold">
            {t`Operational Challenges`}
            <List type="lower-alpha">
              <Typography component="li" variant="bodyMRegular">
                {t`The process of recording and settling transactions on a blockchain depends on the network's stability and performance. Disruptions, high transaction volumes, or network congestion can delay settlement times, affecting the liquidity and availability of assets.`}
              </Typography>
            </List>
          </Typography>
        </List>
      </Paragraph>
    </Section>
  </>
)
