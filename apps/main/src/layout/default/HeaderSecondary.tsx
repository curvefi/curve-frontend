import { t } from '@lingui/macro'
import { useRef } from 'react'
import styled from 'styled-components'

import { DEFAULT_LOCALES } from '@/lib/i18n'
import { breakpoints } from '@/ui/utils/responsive'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { Menu } from '@/layout/default/Header'
import Box from '@/ui/Box'
import ExternalLink from '@/ui/Link/ExternalLink'
import HeaderStats from '@/ui/HeaderStats'
import SelectLocale from '@/ui/Select/SelectLocale'
import SelectThemes from '@/components/SelectThemes'

const HeaderSecondary = ({
  rChainId,
  handleLocaleChange,
}: {
  rChainId: ChainId | ''
  handleLocaleChange(selectedLocale: string): void
}) => {
  const secondaryNavRef = useRef<HTMLDivElement>(null)

  const locale = useStore((state) => state.locale)
  const tvlTotalCached = useStore((state) => state.storeCache.tvlTotal?.[rChainId])
  const tvlTotal = useStore((state) => state.pools.tvlTotal)
  const volumeTotalCached = useStore((state) => state.storeCache.volumeTotal?.[rChainId])
  const volumeTotal = useStore((state) => state.pools.volumeTotal)
  const volumeCryptoShareCached = useStore((state) => state.storeCache.volumeCryptoShare?.[rChainId])
  const volumeCryptoShare = useStore((state) => state.pools.volumeCryptoShare)

  useLayoutHeight(secondaryNavRef, 'secondaryNav')

  const orgUIPath = networks[(rChainId ?? '1') as ChainId].orgUIPath

  return (
    <Wrapper ref={secondaryNavRef} aria-label="Secondary menu">
      <SecondaryNav className="nav-content" grid gridColumnGap={3} flexAlignItems="stretch">
        <Menu
          grid
          gridAutoFlow="column"
          gridColumnGap="var(--spacing-2)"
          flexAlignItems="center"
          flexJustifyContent="left"
        >
          {rChainId && (
            <>
              <HeaderStatsContent>
                <HeaderStats
                  title={t`Total Deposits`}
                  valueCached={tvlTotalCached}
                  value={tvlTotal}
                  parsedVal={formatNumber(tvlTotal ?? tvlTotalCached, {
                    currency: 'USD',
                    showDecimalIfSmallNumberOnly: true,
                  })}
                />
              </HeaderStatsContent>
              <HeaderStatsContent>
                <HeaderStats
                  title={t`Daily Volume`}
                  valueCached={volumeTotalCached}
                  value={volumeTotal}
                  parsedVal={formatNumber(volumeTotal ?? volumeTotalCached, {
                    currency: 'USD',
                    showDecimalIfSmallNumberOnly: true,
                  })}
                />
              </HeaderStatsContent>
              <HeaderStatsContent>
                <HeaderStats
                  title={t`Crypto Volume Share`}
                  valueCached={volumeCryptoShareCached}
                  value={volumeCryptoShare}
                  parsedVal={formatNumber(volumeCryptoShare ?? volumeCryptoShareCached, FORMAT_OPTIONS.PERCENT)}
                />
              </HeaderStatsContent>
            </>
          )}
        </Menu>

        <Menu grid gridAutoFlow="column" gridColumnGap="var(--spacing-1)" flexAlignItems="center">
          <ExternalLinkText href={orgUIPath}>{t`Classic UI`}</ExternalLinkText> <Divider>|</Divider>
          <ExternalLinkText href="https://dao.curve.fi/">{t`DAO`}</ExternalLinkText> <Divider>|</Divider>
          <ExternalLinkText href="https://gov.curve.fi/">{t`Governance`}</ExternalLinkText> <Divider>|</Divider>
          <StyledSelectThemes /> <Divider>|</Divider>
          <StyledSelectLocale
            locales={DEFAULT_LOCALES}
            selectedLocale={locale}
            handleLocaleChange={handleLocaleChange}
          />
        </Menu>
      </SecondaryNav>
    </Wrapper>
  )
}

const StyledSelectLocale = styled(SelectLocale)`
  button {
    border: none;
  }
`

const StyledSelectThemes = styled(SelectThemes)`
  color: inherit;
  line-height: 1;

  :hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }
`

const Divider = styled.p`
  color: var(--page--text-color);
  opacity: 0.3;
`

const ExternalLinkText = styled(ExternalLink)`
  text-decoration: none;
  text-transform: initial;
  margin: 0 var(--spacing-2);

  color: inherit;
`

const SecondaryNav = styled(Box)`
  height: var(--top-nav-height);
  margin: 0 auto;
  max-width: var(--width);
  padding: 0 var(--spacing-normal);
  width: 100%;

  grid-template-columns: 1fr auto;
`

const Wrapper = styled.nav`
  border-bottom: 1px solid var(--nav--border-color);
  font-size: var(--font-size-2);
  font-weight: bold;
  //position: sticky;
  top: 0;

  color: var(--nav--color);
  background-color: var(--page--background-color);
  z-index: var(--z-index-page--top-nav);
`

const HeaderStatsContent = styled.span`
  max-width: 8.375rem; //134px
  margin: 0 var(--spacing-2);
  :first-child {
    margin-left: 0;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    max-width: 18.75rem; //300px
  }
`

export default HeaderSecondary
