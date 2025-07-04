import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { WalletToast } from '@ui-kit/features/connect-wallet'
import { WagmiConnectModal } from '@ui-kit/features/connect-wallet/ui/WagmiConnectModal'
import useUserProfileStore from '@ui-kit/features/user-profile/store'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { isChinese, t } from '@ui-kit/lib/i18n'
import { type AppName, getInternalUrl, PAGE_DISCLAIMER, PAGE_INTEGRATIONS, routeToPage } from '@ui-kit/shared/routes'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { HeaderProps, NavigationSection } from './types'

export const Header = ({ routes, currentApp, ...props }: HeaderProps) => {
  const isDesktop = useIsDesktop()
  const isBeta = useUserProfileStore((state) => state.beta)
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
  return (
    <>
      {isDesktop ? (
        <DesktopHeader pages={pages} sections={sections} {...props} />
      ) : (
        <MobileHeader pages={pages} sections={sections} {...props} />
      )}
      <WalletToast />
      <WagmiConnectModal />
    </>
  )
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
