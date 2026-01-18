import { partition } from 'lodash'
import React, { useMemo, type ReactNode, type ReactElement } from 'react'
import Box from '@mui/material/Box'
import { DEFAULT_SEVERITY, type BannerProps } from '@ui-kit/shared/ui/Banner'

export type StackBannersProps = {
  children: ReactNode
}

const SEVERITY_ORDER: Record<NonNullable<BannerProps['severity']>, number> = {
  alert: 0,
  warning: 1,
  highlight: 2,
  info: 3,
}

const compareBanners = (a: ReactElement<BannerProps>, b: ReactElement<BannerProps>) =>
  SEVERITY_ORDER[a.props.severity || DEFAULT_SEVERITY] - SEVERITY_ORDER[b.props.severity || DEFAULT_SEVERITY]

/**
 * Renders a grouped and sorted list of banners.
 * It separates non-removable banners (without onClick) from removable ones.
 * It renders non-removable first, then removable. Within each group, banners are sorted by severity.
 */
export const StackBanners = ({ children }: StackBannersProps) => {
  const sortedBanners = useMemo(() => {
    const banners = React.Children.toArray(children).filter((child) =>
      React.isValidElement(child),
    ) as ReactElement<BannerProps>[]

    const [removable, nonRemovable] = partition(banners, (el) => !!el.props.onClick)

    return [...nonRemovable.sort(compareBanners), ...removable.sort(compareBanners)]
  }, [children])

  return <Box>{sortedBanners}</Box>
}
