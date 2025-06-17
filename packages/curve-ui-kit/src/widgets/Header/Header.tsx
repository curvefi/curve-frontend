import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import { WalletToast } from '@ui-kit/features/connect-wallet'
import { WagmiConnectModal } from '@ui-kit/features/connect-wallet/ui/WagmiConnectModal'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useBetaFlag } from '@ui-kit/hooks/useLocalStorage'
import { isChinese, t } from '@ui-kit/lib/i18n'
import { type AppName, getInternalUrl, PAGE_DISCLAIMER, PAGE_INTEGRATIONS, routeToPage } from '@ui-kit/shared/routes'
import { DESKTOP_HEADER_HEIGHT, DesktopHeader } from './DesktopHeader'
import { calcMobileHeaderHeight, MobileHeader } from './MobileHeader'
import { HeaderProps, NavigationSection } from './types'

export const Header = ({ routes, currentApp, ...props }: HeaderProps) => {
  const bannerHeight = useLayoutStore((state) => state.height.globalAlert)
  const isDesktop = useIsDesktop()
  const [isBeta] = useBetaFlag()
  const pathname = usePathname()
  const { networkId, currentMenu } = props
  const pages = useMemo(
    () =>
      routes[currentMenu]
        .filter((props) => !props.betaFeature || isBeta)
        .map((props) => routeToPage(props, { networkId, pathname })),
    [currentMenu, isBeta, networkId, pathname, routes],
  )
  const sections = useMemo(() => getSections(currentApp, props.networkId), [currentApp, props.networkId])
  const height = useHeaderHeight(bannerHeight)
  return (
    <>
      {isDesktop ? (
        <DesktopHeader pages={pages} sections={sections} height={height} {...props} />
      ) : (
        <MobileHeader pages={pages} sections={sections} height={height} {...props} />
      )}
      <WagmiConnectModal />
      <WalletToast headerHeight={height} />
    </>
  )
}

/**
 * Helper function to calculate the header height based on the banner height and the current screen size
 */
export const useHeaderHeight = (bannerHeight: number | undefined) => {
  const isDesktop = useIsDesktop()
  const theme = useTheme()
  const headerHeight = isDesktop ? DESKTOP_HEADER_HEIGHT : calcMobileHeaderHeight(theme)
  return `calc(${headerHeight} + ${bannerHeight ?? 0}px)`
}

const getSections = (currentApp: AppName, networkId: string): NavigationSection[] => [
  {
    title: t`Documentation`,
    links: [
      { href: 'https://news.curve.finance/', label: t`News` },
      { href: 'https://resources.curve.finance/lending/understanding-lending/', label: t`User Resources` },
      { href: 'https://docs.curve.finance', label: t`Developer Resources` },
      { href: getInternalUrl(currentApp, networkId, PAGE_DISCLAIMER), label: t`Risk Disclaimers` },
      { href: getInternalUrl(currentApp, networkId, PAGE_INTEGRATIONS), label: t`Integrations` },
      { href: 'https://resources.curve.finance/glossary-branding/branding/', label: t`Branding` },
      ...(isChinese() ? [{ href: 'https://www.curve.wiki/', label: t`Wiki` }] : []),
    ],
  },
  {
    title: t`Security`, // audits, bug bounty, dune analytics, curve monitor & crvhub
    links: [
      { href: 'https://docs.curve.finance/references/audits/', label: t`Audits` },
      { href: 'https://docs.curve.finance/security/security/', label: t`Bug Bounty` },
      { href: 'https://dune.com/mrblock_buidl/Curve.fi', label: t`Dune Analytics` },
      { href: 'https://curvemonitor.com', label: t`Curve Monitor` },
      { href: 'https://crvhub.com/', label: t`Crvhub` },
    ],
  },
]
