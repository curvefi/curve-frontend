import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { getInternalUrl, PAGE_LEGAL } from '@ui-kit/shared/routes'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { pushSearchParams } from '@ui-kit/utils/urls'
import type { TabProps } from '../../types/tabs'
import { List } from '../general/List'
import { Header, Paragraph, Section, Title } from '../general/Section'
import { LegalIntro } from './LegalIntro'

export const LlamaLend = ({ currentApp, network }: TabProps) => (
  <>
    <Section>
      <LegalIntro currentApp={currentApp} network={network} />

      <Paragraph>{t`Curve Lending enables users to permissionlessly create and interact with isolated lending pairs composed of crvUSD, a decentralized stablecoin native to the Curve ecosystem, and various paired tokens. The notifications provided herein address risks associated with Curve Lending activities. The following list is not exhaustive.`}</Paragraph>

      <Paragraph>
        {t`Users wishing to acquaint themselves with a broader range of general risk disclosures are encouraged to read the`}{' '}
        <RouterLink
          color="textSecondary"
          href={getInternalUrl(currentApp, network, PAGE_LEGAL)}
          onClick={(e) => pushSearchParams(e, { tab: 'disclaimers', subtab: 'dex' })}
        >
          {t`Curve Risk Disclosures for Liquidity Providers`}
        </RouterLink>
        {t`. Users are also advised to review the public`}{' '}
        <Link color="textSecondary" href="https://docs.curve.finance/references/audits/" target="_blank">
          {t`audit reports`}
        </Link>{' '}
        {t`to assess the security and reliability of the platform before engaging in any lending or borrowing activities.`}
      </Paragraph>
    </Section>

    <Header>{t`Permissionless Markets Risks`}</Header>
    <Section>
      <Paragraph>
        {t`Curve Lending markets are permissionless, allowing anyone to create and customize markets with unique token pairs, a price oracle, and parameters that influence the LLAMMA liquidation algorithm and interest rate model. Given the protocol's permissionless nature, users should verify that the market has been instantiated with sensible parameters. Curve provides a`}{' '}
        <Link color="textSecondary" href="https://github.com/curvefi/llamma-simulator" target="_blank">
          {t`LLAMMA-simulator`}
        </Link>{' '}
        {t`that can be referenced for finding optimal parameters.`}
      </Paragraph>

      <Paragraph>{t`There are several factors users should consider regarding attributes of the permissionless markets:`}</Paragraph>

      <Paragraph>
        <List type="numeric">
          <Typography component="li" variant="bodyMBold">
            {t`Unvetted Tokens`}
            <List type="lower-alpha">
              <Typography component="li" variant="bodyMRegular">
                {t`Curve Lending pairs consist of crvUSD and one other token, which may not undergo rigorous vetting due to the permissionless lending factory and lack of strict onboarding criteria. As a result, some tokens in Curve pools could be unvetted, introducing potential risks such as exchange rate volatility, smart contract vulnerabilities, and liquidity risks. Users should exercise caution and conduct their due diligence before interacting with any token on the platform.`}
              </Typography>
            </List>
          </Typography>

          <Typography component="li" variant="bodyMBold">
            {t`Oracle Designation`}
            <List type="lower-alpha">
              <Typography component="li" variant="bodyMRegular">
                {t`Curve Lending markets by default use a Curve pool as the oracle, as long as the pool pair contains both tokens in the market and the pool is a Curve tricrypto-ng, twocrypto-ng or stableswap-ng pool, which has manipulation-resistant oracles. However, this creates a dependency on the selected pool oracle, which may become unreliable due to market circumstances (e.g., liquidity migration) or technical bugs.`}
              </Typography>

              <Typography component="li" variant="bodyMRegular">
                {t`Alternatively, market deployers may designate a custom oracle, which can introduce additional trust assumptions or technical risks, and these custom oracles may need to be thoroughly vetted due to permissionless market deployment. Users should fully understand the oracle mechanism before interacting with a Curve Lending market.`}
              </Typography>
            </List>
          </Typography>

          <Typography component="li" variant="bodyMBold">
            {t`Parameter Configuration`}
            <List type="lower-alpha">
              <Typography component="li" variant="bodyMRegular">
                {t`There are several parameters configurable by market deployers, including “A” (number of bands within the LLAMMA algorithm), fee on LLAMMA swaps, loan discount (Loan-To-Value), liquidation discount (RiskListItemquidation Threshold), and min/max borrow rate. Misconfigured AMM parameters may result in greater losses than necessary during liquidation and generally negatively impact user experience involving liquidation. Misconfigured borrow rates may prevent the market from adequately reflecting rates in the broader market, potentially leading to insufficient withdrawal liquidity for lenders. Users should be aware of market parameter configurations and ensure they are suitable for the underlying assets and anticipated market conditions.`}
              </Typography>
            </List>
          </Typography>

          <Typography component="li" variant="bodyMBold">
            {t`Governance`}
            <List type="lower-alpha">
              <Typography component="li" variant="bodyMRegular">
                {t`The Curve Lending admin is the Curve DAO, a decentralized organization made up of veCRV tokenholders. Votes are required to make any change to the Curve Lending system, including individual markets. Votes undergo a 1-week vote period, requiring a 51% approval and a sufficient voter quorum to execute any on-chain actions. The DAO controls critical system functions in Curve Lending, including setting system contract implementations and configuring parameters such as min/max borrow rates, borrow discounts and AMM fees.`}
              </Typography>
            </List>
          </Typography>
        </List>
      </Paragraph>
    </Section>

    <Header>{t`Borrowing Risks`}</Header>
    <Section>
      <Paragraph>{t`Borrowers can choose from various lending markets to borrow crvUSD against another asset or provide crvUSD as collateral. Markets are designated as one-way or two-way. In one-way markets, collateral cannot be lent out to other users. These assets serve solely as collateral to secure the loan and maintain the borrowing capacity within the protocol. Two-way markets allow collateral to be lent out, creating an opportunity for borrowers to earn interest.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`Soft and Hard Liquidation`}</Title>
      <Paragraph>{t`Curve Lending uses a “soft” liquidation process powered by the LLAMMA algorithm. LLAMMA is a market-making contract that manages the liquidation and de-liquidation of collateral via arbitrageurs. This mechanism facilitates arbitrage between the collateral and borrowed asset in line with changes in market price, allowing a smoother liquidation process that strives to minimize user losses. Additional information can be found in the LLAMMA Overview docs.`}</Paragraph>
      <Paragraph>{t`Please consider the following risks when using the Curve Stablecoin infrastructure:`}</Paragraph>
      <Paragraph>{t`If your collateral enters soft-liquidation mode, you can't withdraw it or add more collateral to your position.`}</Paragraph>

      <Paragraph>
        <List type="disc">
          <Typography component="li" variant="bodyMRegular">
            {t`If the price of your collateral drops sharply over a short time interval, it can result in higher losses that may reduce your loan's health.`}
          </Typography>

          <Typography component="li" variant="bodyMRegular">
            {t`If you are in soft-liquidation mode and the price of the collateral appreciates sharply, this can also result in de-liquidation losses. If your loan's health is low, collateral price appreciation can further reduce the loan's health, potentially triggering a hard liquidation.`}
          </Typography>

          <Typography component="li" variant="bodyMRegular">
            {t`If the health of your loan drops to zero or below, your position will get hard-liquidated with no option of de-liquidation.`}
          </Typography>
        </List>
      </Paragraph>

      <Paragraph>{t`Borrowers should be aware that, while in soft liquidation, they essentially pay a fee to arbitrageurs in the form of favorable pricing. This will gradually erode the health of the position, especially during times of high volatility and, importantly, even when the market price of their collateral is increasing. This activity can decrease the position's health and cause it to undergo “hard” liquidation, whereby the collateral is sold off and the Borrower's position is closed. Borrowers are advised to monitor market conditions and actively manage their collateral to mitigate the liquidation risk. Borrowers should also be aware that if the loan's health falls below a certain threshold, hard liquidation could occur, leading to collateral loss.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`Interest Rates`}</Title>
      <Paragraph>{t`The borrowing rate is algorithmically determined based on the utilization rate of the lending markets. It is calculated using a function that accounts for the spectrum of borrowing activity, ranging from conditions where no assets are borrowed (where the rate is set to a minimum) to conditions where all available assets are borrowed (where the rate is set to a maximum). The rates within the described monetary policy are subject to changes only by Curve DAO. More information on the interest rate model can be found in the Semi-log Monetary Policy docs.`}</Paragraph>
    </Section>

    <Header>{t`Lending Risks`}</Header>
    <Section>
      <Paragraph>{t`When participating in lending activities on Curve Lending, Users may deposit crvUSD (or other assets designated for borrowing) into non-custodial Vaults that accrue interest from borrowers. There may also be the opportunity for additional CRV incentives by staking Vault tokens in a Gauge contract, pending DAO approval.`}</Paragraph>
    </Section>

    <Header>{t`Risk of Illiquidity`}</Header>
    <Section>
      <Paragraph>{t`While these Vaults enable Users to supply liquidity and potentially earn returns, Users maintain the right to withdraw their assets at any time, so long as liquidity is available. There may be temporary or permanent states of illiquidity that prevent Lenders from fully or partially withdrawing their funds. This may result from diverse circumstances, including excessive borrow demand, a poorly configured interest rate model, a failure associated with the collateral asset, or a drastic reduction in incentives to a market. Similarly, there may be high volatility in the behavior of either lenders, borrowers, or both, which causes sharp swings in interest rates.`}</Paragraph>
    </Section>

    <Header>{t`Risk of Bad Debt`}</Header>
    <Section>
      <Paragraph>{t`In extreme scenarios, Lenders may experience a shortfall through the accumulation of bad debt. This may occur if collateral prices fall sharply, especially in combination with network congestion that inhibits timely liquidation of positions. In such cases, Borrowers may need a financial motive to repay their debt, and Lenders may race to withdraw any available liquidity, saddling the Lenders remaining in the Vault with the shortfall.`}</Paragraph>
      <Paragraph>{t`Curve Lending is designed to minimize the risk of bad debt through over-collateralization and the LLAMMA liquidation algorithm. While over-collateralization and the LLAMMA algorithm act as risk mitigation tools, they do not fully insulate Lenders from the inherent risks associated with Curve Lending and assets in its markets, including smart contract vulnerabilities, market volatility, failures in economic models, and regulatory challenges that threaten product viability. Lenders are advised to understand their exposure to risks associated with the collateral asset in Vaults they choose to interact with and appreciate the possibility of experiencing partial or total loss.`}</Paragraph>
    </Section>

    <Header>{t`crvUSD Risks`}</Header>
    <Section>
      <Paragraph>{t`Users should be mindful of risks associated with exposure to the crvUSD stablecoin:`}</Paragraph>
      <Paragraph>
        <List type="disc">
          <Typography component="li" variant="bodyMRegular">
            {t`Creating crvUSD carries inherent risks that could lead to partial or complete loss of your assets involved due to its experimental nature. You are responsible for understanding the risks of buying, selling, and using crvUSD and its infrastructure`}
          </Typography>

          <Typography component="li" variant="bodyMRegular">
            {t`The value of crvUSD can fluctuate due to stablecoin market volatility or rapid changes in the liquidity of the stablecoin.`}
          </Typography>

          <Typography component="li" variant="bodyMRegular">
            {t`crvUSD is exclusively issued by smart contracts, without an intermediary. However, the parameters that ensure the proper operation of the crvUSD infrastructure are subject to updates approved by Curve DAO. Users must stay informed about any parameter changes in the stablecoin infrastructure.`}
          </Typography>

          <Typography component="li" variant="bodyMRegular">
            {t`crvUSD is not recognized as legal tender by any authority and is not guaranteed to be accepted for payments, subject to changing regulatory landscapes which may affect its legality and utility.`}
          </Typography>

          <Typography component="li" variant="bodyMRegular">
            {t`Information provided by crvUSD front-end is solely for educational purposes and does not constitute any form of professional advice, leaving users solely responsible for ensuring actions meet their financial goals.`}
          </Typography>

          <Typography component="li" variant="bodyMRegular">
            {t`Despite efforts to maintain price stability, crvUSD faces the risk of depegging due to market volatility, regulatory changes, or technological issues, potentially affecting its value.`}
          </Typography>

          <Typography component="li" variant="bodyMRegular">
            {t`Users of crvUSD are exposed to various technological risks, including irreversible transactions, anonymity and security concerns, software dependency, cybersecurity threats, and operational and settlement risks, which can lead to potential asset loss.`}
          </Typography>

          <Typography component="li" variant="bodyMRegular">
            {t`The continued development and functionality of the crvUSD protocol rely on developer contributions, with no guarantee of sustained involvement, posing a risk to its maintenance and scalability.`}
          </Typography>
        </List>
      </Paragraph>
    </Section>

    <Header>{t`General Financial Risks`}</Header>
    <Section>
      <Title>{t`Volatility`}</Title>
      <Paragraph>{t`Users should be aware that the prices of cryptocurrencies and tokens are highly volatile and subject to dramatic fluctuations due to their speculative nature and variable acceptance as a payment method. The market value of blockchain-based assets can significantly decline, potentially resulting in losses. Transactions within blockchain systems, including Ethereum Mainnet and others, may experience variable costs and speeds, affecting asset access and usability. Users are encouraged to develop their strategies for managing volatility.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`Financial Loss`}</Title>
      <Paragraph>{t`Users should know that cryptocurrencies and tokens are highly experimental and carry significant risks. Engaging in lending and borrowing activities involves irreversible, final, and non-refundable transactions. Users must participate in these activities at their own risk, understanding that the potential for financial loss is substantial. Users are advised to carefully evaluate their lending and borrowing strategies, considering their personal circumstances and financial resources to determine the most suitable situation.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`Use of Financial Terms`}</Title>
      <Paragraph>{t`Financial terms used in the context of Curve Lending, such as “debt,” “lend,” “borrow,” and similar, are meant for analogy purposes only. They draw comparisons between the operations of decentralized finance smart contracts and traditional finance activities, emphasizing the automated and deterministic nature of DeFi systems. These terms should not be interpreted in their traditional financial context, as DeFi transactions involve distinct mechanisms and risks. Users are encouraged to understand the specific meanings within the DeFi framework.`}</Paragraph>
    </Section>
  </>
)
