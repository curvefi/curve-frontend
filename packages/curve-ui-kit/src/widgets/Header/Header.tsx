import { useMemo } from 'react'
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
    () => routes[currentMenu].map((props) => routeToPage(props, { networkId, pathname })),
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
      { href: 'https://news.curve.finance/', label: t`News` },
      { href: 'https://docs.curve.finance/user/llamalend/overview', label: t`User Resources` },
      { href: 'https://docs.curve.finance', label: t`Developer Resources` },
      { href: getInternalUrl(currentApp, networkId, PAGE_LEGAL), label: t`Legal` },
      { href: getInternalUrl(currentApp, networkId, PAGE_INTEGRATIONS), label: t`Integrations` },
      { href: 'https://curvefinance.notion.site/Brand-Assets-1a6599aae064802fba11ce6a9e642d74', label: t`Branding` },
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
