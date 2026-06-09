import { useMemo } from 'react'
import { EXTERNAL_LINKS } from '@ui/utils'
import { WagmiConnectModal } from '@ui-kit/features/connect-wallet/ui/WagmiConnectModal'
import { usePathname } from '@ui-kit/hooks/router'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { isChinese, t } from '@ui-kit/lib/i18n'
import { type AppName, getInternalUrl, PAGE_INTEGRATIONS, PAGE_LEGAL, routeToPage } from '@ui-kit/shared/routes'
import { Toast } from '@ui-kit/widgets/Toast'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { HeaderProps, NavigationSection } from './types'

export const Header = ({ routes, currentApp, ...props }: HeaderProps) => {
  const isDesktop = useIsDesktop()
  const pathname = usePathname()
  const { networkId, currentMenu } = props
  const pages = useMemo(
    () => routes[currentMenu].map(props => routeToPage(props, { networkId, pathname })),
    [currentMenu, networkId, pathname, routes],
  )
  const sections = useMemo(() => getSections(currentApp, props.networkId), [currentApp, props.networkId])
  return (
    <>
      {isDesktop ? (
        <DesktopHeader pages={pages} sections={sections} {...props} />
      ) : (
        <MobileHeader pages={pages} sections={sections} {...props} />
      )}
      <Toast />
      <WagmiConnectModal />
    </>
  )
}

const getSections = (currentApp: AppName, networkId: string): NavigationSection[] => [
  {
    title: t`Documentation`,
    links: [
      { href: EXTERNAL_LINKS.news, label: t`News` },
      { href: EXTERNAL_LINKS.docs.user.llamalend.overview, label: t`User Resources` },
      { href: EXTERNAL_LINKS.docs.root, label: t`Developer Resources` },
      { href: getInternalUrl(currentApp, networkId, PAGE_LEGAL), label: t`Legal` },
      { href: getInternalUrl(currentApp, networkId, PAGE_INTEGRATIONS), label: t`Integrations` },
      { href: EXTERNAL_LINKS.brand.assets, label: t`Branding` },
      ...(isChinese() ? [{ href: EXTERNAL_LINKS.wiki.curve, label: t`Wiki` }] : []),
    ],
  },
  {
    title: t`Security`, // audits, bug bounty, dune analytics, curve monitor & crvhub
    links: [
      { href: EXTERNAL_LINKS.docs.user.security.audits, label: t`Audits` },
      { href: EXTERNAL_LINKS.docs.user.security.bugBounty, label: t`Bug Bounty` },
      { href: EXTERNAL_LINKS.analytics.duneCurveFi, label: t`Dune Analytics` },
      { href: EXTERNAL_LINKS.security.curveMonitor, label: t`Curve Monitor` },
      { href: EXTERNAL_LINKS.security.crvHub, label: t`Crvhub` },
    ],
  },
]
