import { notFalsy } from '@primitives/objects.utils'
import type { SectionLinks } from '@ui/features/layout/routes'
import { isChinese, t } from '@ui/lib/i18n'
import { EXTERNAL_LINKS } from '@ui/lib/resource.constants'

export const getHeaderSections = ({ legalHref, integrationsHref }: SectionLinks) => [
  {
    title: t`Documentation`,
    links: [
      { href: EXTERNAL_LINKS.curve.news, label: t`News` },
      { href: EXTERNAL_LINKS.docs.user.llamalend.overview, label: t`User Resources` },
      { href: EXTERNAL_LINKS.curve.docs, label: t`Developer Resources` },
      { href: legalHref, label: t`Legal` },
      { href: integrationsHref, label: t`Integrations` },
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
