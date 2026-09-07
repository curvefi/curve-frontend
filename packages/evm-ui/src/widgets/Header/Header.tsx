import { useMemo } from 'react'
import { usePathname } from '@evm-ui/hooks/router'
import { PAGE_INTEGRATIONS, PAGE_LEGAL, routeToPage } from '@evm-ui/shared/routes'
import { Toast } from '@evm-ui/widgets/Toast'
import { notFalsy } from '@primitives/objects.utils'
import { useIsDesktop } from '@ui/hooks/useBreakpoints'
import { isChinese, t } from '@ui/lib/i18n'
import { EXTERNAL_LINKS } from '@ui/lib/resource.constants'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { HeaderProps, NavigationSection } from './types'

export const Header = <TApp extends string, TMenuApp extends TApp, TId extends string, TChainId extends number>({
  routes,
  currentApp,
  ...props
}: HeaderProps<TApp, TMenuApp, TId, TChainId>) => {
  const isDesktop = useIsDesktop()
  const pathname = usePathname()
  const { currentMenu, currentNetwork, urlFactory } = props
  const { blockchainId } = currentNetwork
  const pages = useMemo(
    () => routes[currentMenu].map(route => routeToPage(route, { blockchainId, pathname, urlFactory })),
    [currentMenu, blockchainId, pathname, routes, urlFactory],
  )
  const sections = useMemo(
    () => getSections(currentApp, blockchainId, urlFactory),
    [currentApp, blockchainId, urlFactory],
  )
  return (
    <>
      {isDesktop ? (
        <DesktopHeader pages={pages} sections={sections} {...props} />
      ) : (
        <MobileHeader pages={pages} sections={sections} {...props} />
      )}
      <Toast />
    </>
  )
}

const getSections = <TApp extends string>(
  currentApp: TApp,
  blockchainId: string,
  urlFactory: (app: TApp, blockchainId: string, route?: string) => string,
): NavigationSection[] => [
  {
    title: t`Documentation`,
    links: [
      { href: EXTERNAL_LINKS.curve.news, label: t`News` },
      { href: EXTERNAL_LINKS.docs.user.llamalend.overview, label: t`User Resources` },
      { href: EXTERNAL_LINKS.curve.docs, label: t`Developer Resources` },
      { href: urlFactory(currentApp, blockchainId, PAGE_LEGAL), label: t`Legal` },
      { href: urlFactory(currentApp, blockchainId, PAGE_INTEGRATIONS), label: t`Integrations` },
      { href: EXTERNAL_LINKS.brand.assets, label: t`Branding` },
      ...notFalsy(isChinese() && { href: EXTERNAL_LINKS.curve.chinese.wiki, label: t`Wiki` }),
    ],
  },
  {
    title: t`Security`, // audits, bug bounty, dune analytics, curve monitor & crvhub
    links: [
      { href: EXTERNAL_LINKS.docs.user.security.audits, label: t`Audits` },
      { href: EXTERNAL_LINKS.docs.user.security.bugBounty, label: t`Bug Bounty` },
      { href: EXTERNAL_LINKS.monitoring.curveMonitor, label: t`Curve Monitor` },
      { href: EXTERNAL_LINKS.monitoring.crvHub, label: t`Crvhub` },
    ],
  },
]
