import ExternalLink from '@/ui/Link/ExternalLink'
import {
  RiskWrapper,
  RiskTitle,
  RiskSection,
  RiskSubHeadingWrapper,
  RiskSubTitle,
  RiskSubHeading,
  RiskParagraph,
  RiskListItem,
  RiskUnOrderList,
  RiskOrderList,
} from '@/ui/RiskDisclaimer/styles'
import Chip from '@/ui/Typography/Chip'
import { breakpoints } from '@/ui/utils/responsive'
import { t, Trans } from '@lingui/macro'
import type { NextPage } from 'next'

import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import usePageOnMount from '@/hooks/usePageOnMount'
import DocumentHead from '@/layout/DocumentHead'
import Settings from '@/layout/Settings'
import { scrollToTop } from '@/utils/helpers'


const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  usePageOnMount(params, location, navigate)

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Risk Disclaimer`} />
      <Container>
        <RiskWrapper>
          <RiskTitle>{t`Risk Disclaimer`}</RiskTitle>
          <RiskSection>
            <RiskParagraph>
              <Trans>
                Curve Lending enables users to permissionlessly create and interact with isolated lending pairs composed
                of crvUSD, a decentralized stablecoin native to the Curve ecosystem, and various paired tokens. The
                notifications provided herein address risks associated with Curve Lending activities. The following list
                is not exhaustive.
              </Trans>
            </RiskParagraph>
            <RiskParagraph>
              <Trans>
                Users wishing to acquaint themselves with a broader range of general risk disclosures are encouraged to
                read the{' '}
                <ExternalLink $noCap href="https://curve.fi/#/ethereum/risk-disclaimer">
                  Curve Risk Disclosures for Liquidity Providers
                </ExternalLink>
                . Users are also advised to review the public{' '}
                <ExternalLink $noCap href="https://docs.curve.fi/references/audits/">
                  audit reports
                </ExternalLink>{' '}
                to assess the security and reliability of the platform before engaging in any lending or borrowing
                activities.
              </Trans>
            </RiskParagraph>
          </RiskSection>

          <RiskSection>
            <RiskSubTitle>{t`Permissionless Markets Risks`}</RiskSubTitle>
            <RiskParagraph>
              <Trans>
                Curve Lending markets are permissionless, allowing anyone to create and customize markets with unique
                token pairs, a price oracle, and parameters that influence the LLAMMA liquidation algorithm and interest
                rate model. Given the protocol&apos;s permissionless nature, users should verify that the market has
                been instantiated with sensible parameters. Curve provides a{' '}
                <ExternalLink $noCap href="https://github.com/curvefi/llamma-simulator">
                  LLAMMA-simulator
                </ExternalLink>{' '}
                that can be referenced for finding optimal parameters.
              </Trans>
            </RiskParagraph>
            <RiskParagraph>
              <Trans>
                There are several factors users should consider regarding attributes of the permissionless markets:
              </Trans>
            </RiskParagraph>

            <RiskOrderList>
              <RiskListItem>
                <RiskSubHeading>{t`Unvetted Tokens`}</RiskSubHeading>
                <RiskParagraph>
                  <Trans>
                    Curve Lending pairs consist of crvUSD and one other token, which may not undergo rigorous vetting
                    due to the permissionless lending factory and lack of strict onboarding criteria. As a result, some
                    tokens in Curve pools could be unvetted, introducing potential risks such as exchange rate
                    volatility, smart contract vulnerabilities, and liquidity risks. Users should exercise caution and
                    conduct their due diligence before interacting with any token on the platform.
                  </Trans>
                </RiskParagraph>
              </RiskListItem>

              <RiskListItem>
                <RiskSubHeading>Oracle Designation</RiskSubHeading>
                <RiskParagraph>
                  <Trans>
                    Curve Lending markets by default use a Curve pool as the oracle, as long as the pool pair contains
                    both tokens in the market and the pool is a Curve tricrypto-ng, twocrypto-ng or stableswap-ng pool,
                    which has manipulation-resistant oracles. However, this creates a dependency on the selected pool
                    oracle, which may become unreliable due to market circumstances (e.g., liquidity migration) or
                    technical bugs.
                  </Trans>
                </RiskParagraph>
                <RiskParagraph>
                  <Trans>
                    Alternatively, market deployers may designate a custom oracle, which can introduce additional trust
                    assumptions or technical risks, and these custom oracles may need to be thoroughly vetted due to
                    permissionless market deployment. Users should fully understand the oracle mechanism before
                    interacting with a Curve Lending market.
                  </Trans>
                </RiskParagraph>
              </RiskListItem>

              <RiskListItem>
                <RiskSubHeading>{t`Parameter Configuration`}</RiskSubHeading>
                <RiskParagraph>
                  <Trans>
                    There are several parameters configurable by market deployers, including &ldquo;A&rdquo; (number of
                    bands within the LLAMMA algorithm), fee on LLAMMA swaps, loan discount (Loan-To-Value), liquidation
                    discount (RiskListItemquidation Threshold), and min/max borrow rate. Misconfigured AMM parameters
                    may result in greater losses than necessary during liquidation and generally negatively impact user
                    experience involving liquidation. Misconfigured borrow rates may prevent the market from adequately
                    reflecting rates in the broader market, potentially leading to insufficient withdrawal liquidity for
                    lenders. Users should be aware of market parameter configurations and ensure they are suitable for
                    the underlying assets and anticipated market conditions.
                  </Trans>
                </RiskParagraph>
              </RiskListItem>

              <RiskListItem>
                <RiskSubHeading>{t`Governance`}</RiskSubHeading>
                <RiskParagraph>
                  <Trans>
                    The Curve Lending admin is the Curve DAO, a decentralized organization made up of veCRV
                    tokenholders. Votes are required to make any change to the Curve Lending system, including
                    individual markets. Votes undergo a 1-week vote period, requiring a 51% approval and a sufficient
                    voter quorum to execute any on-chain actions. The DAO controls critical system functions in Curve
                    Lending, including setting system contract implementations and configuring parameters such as
                    min/max borrow rates, borrow discounts and AMM fees.
                  </Trans>
                </RiskParagraph>
              </RiskListItem>
            </RiskOrderList>
          </RiskSection>

          <RiskSection>
            <RiskSubTitle>{t`Borrowing Risks`}</RiskSubTitle>
            <RiskParagraph>
              <Trans>
                Borrowers can choose from various lending markets to borrow crvUSD against another asset or provide
                crvUSD as collateral. Markets are designated as one-way or two-way. In one-way markets, collateral
                cannot be lent out to other users. These assets serve solely as collateral to secure the loan and
                maintain the borrowing capacity within the protocol. Two-way markets allow collateral to be lent out,
                creating an opportunity for borrowers to earn interest.
              </Trans>
            </RiskParagraph>

            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`Soft and Hard Liquidation`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  Curve Lending uses a &ldquo;soft&rdquo; liquidation process powered by the LLAMMA algorithm. LLAMMA is
                  a market-making contract that manages the liquidation and de-liquidation of collateral via
                  arbitrageurs. This mechanism facilitates arbitrage between the collateral and borrowed asset in line
                  with changes in market price, allowing a smoother liquidation process that strives to minimize user
                  losses. Additional information can be found in the LLAMMA Overview docs.
                </Trans>
              </RiskParagraph>
              <RiskParagraph>
                <Trans>Please consider the following risks when using the Curve Stablecoin infrastructure:</Trans>
              </RiskParagraph>

              <RiskUnOrderList>
                <RiskListItem>
                  <Trans>
                    If your collateral enters soft-liquidation mode, you can&apos;t withdraw it or add more collateral
                    to your position.
                  </Trans>
                </RiskListItem>
                <RiskListItem>
                  <Trans>
                    If the price of your collateral drops sharply over a short time interval, it can result in higher
                    losses that may reduce your loan&apos;s health.
                  </Trans>
                </RiskListItem>
                <RiskListItem>
                  <Trans>
                    If you are in soft-liquidation mode and the price of the collateral appreciates sharply, this can
                    also result in de-liquidation losses. If your loan&apos;s health is low, collateral price
                    appreciation can further reduce the loan&apos;s health, potentially triggering a hard liquidation.
                  </Trans>
                </RiskListItem>
                <RiskListItem>
                  <Trans>
                    If the health of your loan drops to zero or below, your position will get hard-liquidated with no
                    option of de-liquidation.
                  </Trans>
                </RiskListItem>
              </RiskUnOrderList>
              <RiskParagraph>
                <Trans>
                  Borrowers should be aware that, while in soft liquidation, they essentially pay a fee to arbitrageurs
                  in the form of favorable pricing. This will gradually erode the health of the position, especially
                  during times of high volatility and, importantly, even when the market price of their collateral is
                  increasing. This activity can decrease the position&apos;s health and cause it to undergo
                  &ldquo;hard&rdquo; liquidation, whereby the collateral is sold off and the Borrower&apos;s position is
                  closed. Borrowers are advised to monitor market conditions and actively manage their collateral to
                  mitigate the liquidation risk. Borrowers should also be aware that if the loan&apos;s health falls
                  below a certain threshold, hard liquidation could occur, leading to collateral loss.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>

            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`Interest Rates`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  The borrowing rate is algorithmically determined based on the utilization rate of the lending markets.
                  It is calculated using a function that accounts for the spectrum of borrowing activity, ranging from
                  conditions where no assets are borrowed (where the rate is set to a minimum) to conditions where all
                  available assets are borrowed (where the rate is set to a maximum). The rates within the described
                  monetary policy are subject to changes only by Curve DAO. More information on the interest rate model
                  can be found in the Semi-log Monetary Policy docs.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>

            <RiskSubTitle>{t`Lending Risks`}</RiskSubTitle>
            <RiskParagraph>
              <Trans>
                When participating in lending activities on Curve Lending, Users may deposit crvUSD (or other assets
                designated for borrowing) into non-custodial Vaults that accrue interest from borrowers. There may also
                be the opportunity for additional CRV incentives by staking Vault tokens in a Gauge contract, pending
                DAO approval.
              </Trans>
            </RiskParagraph>

            <RiskSubHeadingWrapper>
              <RiskSubTitle>{t`Risk of Illiquidity`}</RiskSubTitle>
              <RiskParagraph>
                <Trans>
                  While these Vaults enable Users to supply liquidity and potentially earn returns, Users maintain the
                  right to withdraw their assets at any time, so long as liquidity is available. There may be temporary
                  or permanent states of illiquidity that prevent Lenders from fully or partially withdrawing their
                  funds. This may result from diverse circumstances, including excessive borrow demand, a poorly
                  configured interest rate model, a failure associated with the collateral asset, or a drastic reduction
                  in incentives to a market. Similarly, there may be high volatility in the behavior of either lenders,
                  borrowers, or both, which causes sharp swings in interest rates.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>

            <RiskSubHeadingWrapper>
              <RiskSubTitle>{t`Risk of Bad Debt`}</RiskSubTitle>
              <RiskParagraph>
                <Trans>
                  In extreme scenarios, Lenders may experience a shortfall through the accumulation of bad debt. This
                  may occur if collateral prices fall sharply, especially in combination with network congestion that
                  inhibits timely liquidation of positions. In such cases, Borrowers may need a financial motive to
                  repay their debt, and Lenders may race to withdraw any available liquidity, saddling the Lenders
                  remaining in the Vault with the shortfall.
                </Trans>
              </RiskParagraph>
              <RiskParagraph>
                <Trans>
                  Curve Lending is designed to minimize the risk of bad debt through over-collateralization and the
                  LLAMMA liquidation algorithm. While over-collateralization and the LLAMMA algorithm act as risk
                  mitigation tools, they do not fully insulate Lenders from the inherent risks associated with Curve
                  Lending and assets in its markets, including smart contract vulnerabilities, market volatility,
                  failures in economic models, and regulatory challenges that threaten product viability. Lenders are
                  advised to understand their exposure to risks associated with the collateral asset in Vaults they
                  choose to interact with and appreciate the possibility of experiencing partial or total loss.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>
          </RiskSection>

          <RiskSection>
            <RiskSubTitle>{t`crvUSD Risks`}</RiskSubTitle>
            <RiskParagraph>
              <Trans>Users should be mindful of risks associated with exposure to the crvUSD stablecoin:</Trans>
            </RiskParagraph>
            <RiskUnOrderList>
              <RiskListItem>
                <Trans>
                  Investing in crvUSD carries inherent risks that could lead to partial or complete loss of your
                  investment due to its experimental nature. You are responsible for understanding the risks of buying,
                  selling, and using crvUSD and its infrastructure.
                </Trans>
              </RiskListItem>
              <RiskListItem>
                <Trans>
                  The value of crvUSD can fluctuate due to stablecoin market volatility or rapid changes in the
                  liquidity of the stablecoin.
                </Trans>
              </RiskListItem>
              <RiskListItem>
                <Trans>
                  crvUSD is exclusively issued by smart contracts, without an intermediary. However, the parameters that
                  ensure the proper operation of the crvUSD infrastructure are subject to updates approved by Curve DAO.
                  Users must stay informed about any parameter changes in the stablecoin infrastructure.
                </Trans>
              </RiskListItem>
              <RiskListItem>
                <Trans>
                  crvUSD is not recognized as legal tender by any authority and is not guaranteed to be accepted for
                  payments, subject to changing regulatory landscapes which may affect its legality and utility.
                </Trans>
              </RiskListItem>
              <RiskListItem>
                <Trans>
                  Information provided by crvUSD front-end is solely for educational purposes and does not constitute
                  any form of professional advice, leaving users solely responsible for ensuring actions meet their
                  financial goals.
                </Trans>
              </RiskListItem>
              <RiskListItem>
                <Trans>
                  Despite efforts to maintain price stability, crvUSD faces the risk of depegging due to market
                  volatility, regulatory changes, or technological issues, potentially affecting its value.
                </Trans>
              </RiskListItem>
              <RiskListItem>
                <Trans>
                  Users of crvUSD are exposed to various technological risks, including irreversible transactions,
                  anonymity and security concerns, software dependency, cybersecurity threats, and operational and
                  settlement risks, which can lead to potential asset loss.
                </Trans>
              </RiskListItem>
              <RiskListItem>
                <Trans>
                  The continued development and functionality of the crvUSD protocol rely on developer contributions,
                  with no guarantee of sustained involvement, posing a risk to its maintenance and scalability.
                </Trans>
              </RiskListItem>
            </RiskUnOrderList>
          </RiskSection>

          <RiskSection>
            <RiskSubTitle>{t`General Financial Risks`}</RiskSubTitle>
            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`Volatility`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  Users should be aware that the prices of cryptocurrencies and tokens are highly volatile and subject
                  to dramatic fluctuations due to their speculative nature and variable acceptance as a payment method.
                  The market value of blockchain-based assets can significantly decline, potentially resulting in
                  losses. Transactions within blockchain systems, including Ethereum Mainnet and others, may experience
                  variable costs and speeds, affecting asset access and usability. Users are encouraged to develop their
                  strategies for managing volatility.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>

            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`Financial Loss`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  Users should know that cryptocurrencies and tokens are highly experimental and carry significant
                  risks. Engaging in lending and borrowing activities involves irreversible, final, and non-refundable
                  transactions. Users must participate in these activities at their own risk, understanding that the
                  potential for financial loss is substantial. Users are advised to carefully evaluate their lending and
                  borrowing strategies, considering their personal circumstances and financial resources to determine
                  the most suitable situation.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>

            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`Use of Financial Terms`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  Financial terms used in the context of Curve Lending, such as &ldquo;debt,&rdquo; &ldquo;lend,&rdquo;
                  &ldquo;borrow,&rdquo; and similar, are meant for analogy purposes only. They draw comparisons between
                  the operations of decentralized finance smart contracts and traditional finance activities,
                  emphasizing the automated and deterministic nature of DeFi systems. These terms should not be
                  interpreted in their traditional financial context, as DeFi transactions involve distinct mechanisms
                  and risks. Users are encouraged to understand the specific meanings within the DeFi framework.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>
          </RiskSection>

          <Chip size="sm">
            For up-to-date risk disclaimer,{' '}
            <ExternalLink $noCap href="https://hackmd.io/@LlamaRisk/curve_lending_risk">
              click here
            </ExternalLink>
            .
          </Chip>
        </RiskWrapper>
      </Container>
      <Settings showScrollButton />
    </>
  )
}

const Container = styled.div`
  margin: 0 auto;
  max-width: var(--width);
  min-height: 50vh;

  @media (min-width: 46.875rem) {
    margin: 1.5rem 0;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem;
  }
`

export default Page
