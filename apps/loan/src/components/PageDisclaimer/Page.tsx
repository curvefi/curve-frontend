import type { NextPage } from 'next'

import { t, Trans } from '@lingui/macro'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'

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
import DocumentHead from '@/layout/DocumentHead'
import ExternalLink from '@/ui/Link/ExternalLink'
import Settings from '@/layout/Settings'

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
                Curve stablecoin infrastructure enables users to mint crvUSD using a selection of crypto-tokenized
                collaterals (adding new ones is subject to DAO approval). Interacting with crvUSD doesn&apos;t come
                without risks. Before minting or taking exposure of crvUSD, it is best to research and understand the
                risks involved.
              </Trans>
            </RiskParagraph>

            <RiskParagraph>
              <ExternalLink $noCap href="https://docs.curve.fi/references/whitepapers/curve-stablecoin/">
                {t`crvUSD Whitepaper`}
              </ExternalLink>
              <br />
              <ExternalLink $noCap href="https://docs.curve.fi/references/audits/#curve-stablecoin-and-lending">
                {t`crvUSD smart contract Audits`}
              </ExternalLink>
            </RiskParagraph>
          </RiskSection>

          <RiskSection>
            <RiskSubTitle>{t`crvUSD Design Risks`}</RiskSubTitle>
            <RiskParagraph>
              <Trans>
                crvUSD has unique design features that Users should fully understand before interacting with the
                protocol.
              </Trans>
            </RiskParagraph>

            <RiskOrderList>
              <RiskListItem>
                <RiskSubHeading>{t`Soft-Liquidation and Hard-Liquidation`}</RiskSubHeading>
                <RiskParagraph>
                  <Trans>
                    Collateralized debt positions are managed passively through arbitrage opportunities: if the
                    collateral&apos;s price decreases, the system automatically sells off collateral to arbitrageurs in
                    a ‘soft-liquidation mode’. If the collateral&apos;s price increases, the system recovers the
                    collateral. This algorithm is designed to dynamically adjust the collateral backing each crvUSD in
                    real-time, responding to fluctuating market conditions. While this approach is intended to mitigate
                    the severity of traditional liquidations—a process where collateral becomes insufficient, leading to
                    irreversible sales at potentially undervalued prices—it does not eliminate the inherent risk of
                    collateral volatility. Additional information can be found on{' '}
                    <ExternalLink $noCap href="https://docs.curve.fi/crvUSD/amm/">
                      LLAMMA Overview
                    </ExternalLink>
                    .
                  </Trans>
                </RiskParagraph>
                <br />
                <RiskParagraph>
                  <Trans>
                    Borrowers in the crvUSD ecosystem are subject to specific risks associated with the liquidation
                    process. It is crucial to understand that if the User’s collateral is placed into soft-liquidation
                    mode, they are prohibited from withdrawing the collateral or augmenting their position with
                    additional collateral. Entering soft-liquidation mode locks the collateral, removing the option to
                    withdraw or add to it. In case market conditions suggest a strategic adjustment to the User’s
                    position, they may face exacerbated risk due to such restrictions.
                  </Trans>
                </RiskParagraph>
                <br />
                <RiskParagraph>
                  <Trans>
                    Users should be cautious about collateral management, as a sharp decline in the price of the
                    collateral within a brief period can escalate losses, further deteriorating the health of the loan.
                    Respectively, an increase in the collateral&apos;s value while in soft-liquidation can also cause
                    “de-liquidation losses” - a situation where an appreciating market price for the collateral may
                    negatively impact the loan’s health. During periods of high volatility and/or high Ethereum gas
                    prices, arbitrage may be less efficient, causing losses incurred from soft liquidation to be
                    exacerbated.
                  </Trans>
                </RiskParagraph>
                <br />
                <RiskParagraph>
                  <Trans>
                    If the health of the loan falls to zero, the position is subject to hard liquidation, which is an
                    irreversible process resulting in the loss of the collateral with no possibility of recovery or
                    de-liquidation. This scenario underscores the critical need for risk management when using leverage.
                    Leverage and collateral management should be approached with caution, reflecting a balanced
                    assessment of potential gains against the risk of significant financial loss.
                  </Trans>
                </RiskParagraph>
              </RiskListItem>

              <RiskListItem>
                <RiskSubHeading>{t`Curve Pool EMA Oracles`}</RiskSubHeading>
                <RiskParagraph>
                  <Trans>
                    Curve incorporates specialized on-chain Exponential Moving Average (EMA) oracles built into
                    stabelswap-ng, tricrypto-ng, and twocrypto-ng Curve pool implementations. crvUSD markets derive
                    price information from a select number of high TVL Curve pools. By utilizing the EMA smoothing
                    methodology, oracles mitigate the impact of transient price fluctuations, aiming to reduce
                    unnecessary losses caused by short-term market volatility or attempts to manipulate the oracle.
                    Despite the manipulation-resistant design specification, Curve pool oracles may exhibit price
                    distortions in certain scenarios that have the potential to result in missed or excessive
                    liquidations. This may be a result of liquidity and volume migration to alternate venues that
                    increase the risk of oracle manipulation. A detailed explanation of the aforementioned terms can be
                    found in the{' '}
                    <ExternalLink $noCap href="https://docs.curve.fi/crvUSD/oracle/">
                      crvUSD Oracle
                    </ExternalLink>{' '}
                    documentation.
                  </Trans>
                </RiskParagraph>
              </RiskListItem>

              <RiskListItem>
                <RiskSubHeading>{t`Pegkeepers`}</RiskSubHeading>
                <RiskParagraph>
                  <Trans>
                    crvUSD makes use of Pegkeepers, contracts authorized to deposit and withdraw crvUSD from a
                    whitelisted Curve crvUSD stableswap pool up to a predefined debt cap. These contracts reference a
                    subset of whitelisted stablecoins as a proxy for the intended USD price. Instability affecting any
                    counterparty Pegkeeper assets (e.g. USDT, USDC), which are also used to aggregate a USD price for
                    crvUSD, may cause the Pegkeeper to deposit all of its crvUSD into the pool in an attempt to
                    rebalance. This creates a dependency on the Pegkeeper counterparty assets that determines the
                    stability of the crvUSD peg. An upgraded PegkeeperV2 design promises to alleviate this risk.
                  </Trans>
                </RiskParagraph>
              </RiskListItem>

              <RiskListItem>
                <RiskSubHeading>{t`Dynamic Interest Rates`}</RiskSubHeading>
                <RiskParagraph>
                  <Trans>The borrowing rate is algorithmically determined based on several factors, including</Trans>
                </RiskParagraph>
                <br />

                <RiskUnOrderList>
                  <RiskListItem>
                    <Trans>the crvUSD price as reported by an on-chain price aggregator contract,</Trans>
                  </RiskListItem>
                  <RiskListItem>
                    <Trans>the ratio of Pegkeeper debt to total outstanding debt,</Trans>
                  </RiskListItem>
                  <RiskListItem>
                    <Trans>several variables set by the Monetary Policy admin</Trans>
                  </RiskListItem>
                </RiskUnOrderList>

                <RiskParagraph>
                  <Trans>
                    Essentially, the borrow rate increases when the price of crvUSD goes lower and/or the proportion of
                    Pegkeeper debt to total debt reduces. This process is intended to dynamically regulate market
                    behavior such that it reinforces the crvUSD peg. Changes to the Monetary Policy are authorized only
                    by the Curve DAO. A{' '}
                    <ExternalLink $noCap href="crvUSD rate tool">
                      crvUSD rate tool
                    </ExternalLink>{' '}
                    by 0xReviews allows Users to visualize the influence of these factors on the borrowing rate.
                  </Trans>
                </RiskParagraph>
                <br />
                <RiskParagraph>
                  <Trans>
                    There may be assumptions in the Monetary Policy design that, in some circumstances, cause interest
                    rates to produce undesired outcomes, and which may cause a sub-optimal experience for borrowers. In
                    general, interest rates on borrowing may change dramatically in response to changing market
                    circumstances, and may not reflect a borrower&apos;s expectations when they had opened their
                    position.
                  </Trans>
                </RiskParagraph>
              </RiskListItem>
            </RiskOrderList>
          </RiskSection>

          <RiskSection>
            <RiskSubTitle>{t`Market Risks`}</RiskSubTitle>
            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`Liquidity Risk`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  Users should be aware that ample crvUSD liquidity on exchange is necessary for facilitating
                  liquidations. Circumstances leading to a reduction in the available crvUSD liquidity for liquidators
                  are plausible. Such scenarios can significantly impact the proper functioning of the stablecoin
                  market, particularly concerning the process of liquidation.
                </Trans>
              </RiskParagraph>
              <RiskParagraph>
                <Trans>
                  crvUSD relies on liquidity concentrated within particular Pegkeeper pools, which serve a dual purpose
                  as both a source of liquidity and price feeds for crvUSD oracles. If the incentives for depositing
                  crvUSD into these pools are insufficient, the liquidity shortfalls can result in missed liquidations
                  or deflationary price spirals (cascading liquidations). This phenomenon occurs when initial
                  liquidations fail to be executed effectively, leading to a domino effect of further liquidations and
                  potentially rapid, significant decreases in asset prices.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>

            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`No Guarantee of Price Stability`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  The value of the crypto assets used as collateral for crvUSD is subject to high levels of volatility
                  and unpredictability. The pricing of these assets may be extremely speculative and prone to rapid
                  fluctuations. Such market characteristics can impact the stability of crvUSD’s value. While the LLAMMA
                  algorithm aims to adjust collateral levels to support crvUSD’s value, there is no guarantee that these
                  adjustments will always preserve stability, especially during periods of extreme market volatility.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>

            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`Depegging Risk`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  The blockchain ecosystem has witnessed instances where stablecoins experienced significant and
                  prolonged periods of depegging from their intended value. Despite the innovative measures designed to
                  uphold price stability, crvUSD is not exempt from the risk of depegging. Market volatility, shifts in
                  regulatory landscapes, sudden and substantial changes in the value of collateral assets, or unforeseen
                  technical issues can precipitate a departure from its pegged value.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>
          </RiskSection>

          <RiskSection>
            <RiskSubTitle>{t`Technology Risk`}</RiskSubTitle>
            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`Smart Contract Risk`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  crvUSD relies on smart contracts, which are self-executing pieces of code. While these contracts are
                  designed to be secure, there is a risk that they may contain vulnerabilities or bugs. Malicious actors
                  could exploit these vulnerabilities, resulting in the loss of funds or other adverse consequences.
                  Users need to conduct due diligence and review the smart contracts and security audit reports to
                  assess the inherent risks.
                </Trans>
              </RiskParagraph>
              <RiskParagraph>
                <Trans>
                  Curve smart contracts have undergone multiple audits by reputable firms, including MixBytes and
                  ChainSecurity, to enhance protocol security. While smart contract audits play an important role in
                  good security practices to mitigate user risks, they don&apos;t eliminate all risks. Users should
                  always exercise caution regardless of Curve&apos;s commitment to protocol security.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>

            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`No Loss Prevention`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  crvUSD and its underlying infrastructure are in an early stage of development, are inherently
                  experimental, and carry a significant degree of risk. Engagement with crvUSD during this phase should
                  be approached with the understanding that it may lead to partial or complete loss of funds. Users
                  considering minting, redeeming, or utilizing crvUSD should be prepared for the possibility of
                  encountering technical issues, bugs, or vulnerabilities that could impact the value of crvUSD or the
                  safety of allocated crypto assets.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>

            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`General Blockchain Technology Risks`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  Engaging with crypto assets involves exposure to a range of technological risks inherent to the use of
                  new and evolving technologies. Users must be aware of key risk factors (as outlined below) and
                  consider their implications for crypto asset transactions.
                </Trans>
              </RiskParagraph>
              <RiskUnOrderList>
                <RiskListItem>
                  <Trans>
                    <strong>Irreversibility of Transactions</strong>: Once executed, transactions in crypto assets
                    cannot be reversed. Errors or accidental transactions cannot be easily rectified, potentially
                    leading to permanent loss of assets.
                  </Trans>
                </RiskListItem>
                <RiskListItem>
                  <Trans>
                    <strong>Anonymity</strong>: The degree of anonymity provided by blockchain technology can complicate
                    the tracing of funds and the identification of parties in transactions.
                  </Trans>
                </RiskListItem>
                <RiskListItem>
                  <Trans>
                    <strong>Software Dependencies</strong>: Crypto asset operations rely heavily on the flawless
                    functioning of complex software, including wallets, smart contracts, and blockchain networks. Any
                    defects, bugs, or vulnerabilities in software can impair access to or use of crypto assets, leading
                    to potential losses.
                  </Trans>
                </RiskListItem>
                <RiskListItem>
                  <Trans>
                    <strong>Cybersecurity Incidents</strong>: The digital nature of crypto assets makes them a target
                    for hackers, malicious actors, and other cybersecurity threats. Failures, hacks, exploits, protocol
                    errors, and unforeseen vulnerabilities can compromise the security of assets, resulting in theft,
                    loss, or unauthorized access.
                  </Trans>
                </RiskListItem>
                <RiskListItem>
                  <Trans>
                    <strong>Operational Challenges</strong>: The process of recording and settling transactions on a
                    blockchain depends on the network&apos;s stability and performance. Disruptions, high transaction
                    volumes, or network congestion can delay settlement times, affecting the liquidity and availability
                    of assets.
                  </Trans>
                </RiskListItem>
              </RiskUnOrderList>
            </RiskSubHeadingWrapper>
          </RiskSection>

          <RiskSection>
            <RiskSubTitle>{t`Counterparty Risks`}</RiskSubTitle>

            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`Access Control`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  crvUSD markets (Controller smart contracts) are intentionally designed to be immutable and
                  noncustodial, meaning they cannot be upgraded and minters always retain full control and
                  responsibility over their funds. While this characteristic may limit protective actions in case of
                  emergencies, it significantly strengthens user assurances about custody of their funds.
                </Trans>
              </RiskParagraph>
              <RiskParagraph>
                <Trans>
                  The crvUSD protocol is governed by a Decentralized Autonomous Organization (DAO) comprised of veCRV
                  tokenholders that requires a 1-week vote period with 51% approval and a sufficient voter quorum to
                  execute any actions. It controls critical system functions, including deploying new crvUSD markets,
                  setting implementation contracts, and setting parameters that influence market behavior.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>

            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`No Control`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  crvUSD functions in a decentralized way, with its issuance and operational mechanics governed
                  exclusively by smart contracts, without reliance on any intermediaries. While the adjustment of
                  stablecoin critical parameters is subject to Curve DAO approvals, Users must understand that Curve DAO
                  does not act as a broker, agent, advisor, or in any fiduciary capacity towards crvUSD users.
                  Consequently, Curve DAO bears no obligation to ensure that the use of crvUSD aligns with each one’s
                  financial objectives, strategies, or risk tolerance levels.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>

            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`Developer Dependency`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  The ongoing development, maintenance, and scalability of the crvUSD protocol is dependent on
                  developers&apos; contributions. While numerous developers are currently engaged in the project, there
                  is no assurance that this level of contribution will persist indefinitely. The future involvement of
                  developers is subject to change due to a variety of factors that could influence their capacity or
                  willingness to contribute.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>
          </RiskSection>

          <RiskSection>
            <RiskSubTitle>{t`Regulatory Risks`}</RiskSubTitle>
            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`Regulatory Uncertainty`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  crvUSD is not recognized as a legal tender by any government authority, central bank, or legal
                  jurisdiction. Users should be aware that the lack of legal tender status means that no statutory,
                  governmental, or corporate entity is obligated to accept the stablecoin as payment for goods,
                  services, debts, or other obligations. The regulatory environment around crypto assets and stablecoins
                  remains fluid and subject to change across jurisdictions. This poses a risk that the legal status of
                  the stablecoin could be altered, potentially affecting its use, transfer, holding, and value.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>
            <RiskSubHeadingWrapper>
              <RiskSubHeading>{t`No Investment and Legal Advice`}</RiskSubHeading>
              <RiskParagraph>
                <Trans>
                  The data and communications made available on the crvUSD platform, including but not limited to its
                  front-end interfaces, are intended purely for informational purposes and should not under any
                  circumstances be interpreted as constituting investment, financial, trading, legal, or any form of
                  professional advice. The content provided through the crvUSD front-end interface(s) is designed to
                  support users&apos; understanding of the stablecoin, the protocol, and its functionalities, not to
                  guide or influence decision-making regarding investments or financial strategies. Users must be aware
                  that they are the only entity capable of adequately assessing whether an action taken aligns with
                  their financial objectives and circumstances.
                </Trans>
              </RiskParagraph>
            </RiskSubHeadingWrapper>
          </RiskSection>

          <RiskSection>
            <em>
              <Trans>
                Disclaimer: The information provided within this context does not constitute financial, legal, or tax
                advice personalized to your specific circumstances. The content presented is for informational purposes
                only and should not be relied upon as a substitute for professional advice tailored to your individual
                needs. It is recommended that you seek the advice of qualified professionals regarding financial, legal,
                and tax matters before engaging in any activities on Curve.
              </Trans>
            </em>
          </RiskSection>

          <Chip size="sm">
            For up-to-date risk disclaimer,{' '}
            <ExternalLink $noCap href="https://hackmd.io/@LlamaRisk/HyKyAe-yR">
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
