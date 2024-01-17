import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'

import DocumentHead from '@/layout/DocumentHead'
import Settings from '@/layout/Settings'
import { ExternalLink } from '@/ui/Link'

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
        <Title>{t`Risk Disclaimer`}</Title>
        <p>
          Curve Stablecoin infrastructure enables users to mint crvUSD using a selection of crypto-tokenized collaterals
          (adding new ones are subject to DAO approval). Positions are managed passively: if the collateral&apos;s price
          decreases, the system automatically sells off collateral in a &lsquo;soft liquidation mode&rsquo;. If the
          collateral&apos;s price increases, the system recovers the collateral. This process could lead to some losses
          due to liquidation and de-liquidation. Additional information can be found on{' '}
          <StyledExternalLink href="https://docs.curve.fi/LLAMMA/overview/">LLAMMA Overview</StyledExternalLink>.
        </p>

        <p>Please consider the following risk disclaimers when using the Curve Stablecoin infrastructure:</p>

        <DisclaimerItems>
          <DisclaimerItem>
            <ol>
              <li>
                If your collateral enters soft-liquidation mode, you can&apos;t withdraw it or add more collateral to
                your position.
              </li>
              <li>
                Should the price of the collateral change drop sharply over a short time interval, it can result in
                large losses that may reduce your loan&apos;s health.
              </li>
              <li>
                If you are in soft-liquidation mode and the price of the collateral goes up sharply, this can result in
                de-liquidation losses on the way up. If your loan&apos;s health is low, value of collateral going up
                could potentially reduce your underwater loan&apos;s health.
              </li>
              <li>
                If the health of your loan drops to zero or below, your position will get hard-liquidated with no option
                of de-liquidation. Please choose your leverage wisely, as you would with any collateralized debt
                position.
              </li>
            </ol>
          </DisclaimerItem>
          <DisclaimerItem>
            The crvUSD stablecoin and its infrastructure are currently in beta testing. As a result, investing in crvUSD
            carries high risk and could lead to partial or complete loss of your investment due to its experimental
            nature. You are responsible for understanding the associated risks of buying, selling, and using crvUSD and
            its infrastructure.
          </DisclaimerItem>
          <DisclaimerItem>
            The value of crvUSD can fluctuate due to stablecoin market volatility or rapid changes in the liquidity of
            the stablecoin.
          </DisclaimerItem>
          <DisclaimerItem>
            crvUSD is exclusively issued by smart contracts, without an intermediary. However, the parameters that
            ensure the proper operation of the crvUSD infrastructure are subject to updates approved by Curve DAO. Users
            must stay informed about any parameter changes in the stablecoin infrastructure.
          </DisclaimerItem>
        </DisclaimerItems>
      </Container>
      <Settings showScrollButton />
    </>
  )
}

const Container = styled.div`
  margin: 0 auto;
  max-width: 600px; // 500px
  min-height: 40vh;
  padding: var(--spacing-4);
  background-color: var(--table--background-color);
  border: 1px solid var(--box--secondary--border);

  @media (min-width: ${breakpoints.sm}rem) {
    margin: 1rem auto;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 3rem auto;
  }

  p,
  ol,
  li {
    padding: revert;
    margin: revert;
  }

  ol {
    padding-left: 1.0625rem; // 17px
  }

  li {
    margin-bottom: 0.5rem;
  }
`

const Title = styled.h1`
  font-size: var(--font-size-7);
`

const DisclaimerItem = styled.li`
  list-style: revert;
  list-style-position: revert;

  > ol > li {
    list-style: lower-alpha;
    list-style-position: revert;
  }
`

const StyledExternalLink = styled(ExternalLink)`
  text-transform: initial;
`

const DisclaimerItems = styled.ol``

export default Page
