import type { ReactNode } from 'react'
import Link from '@mui/material/Link'
import { Link as TanstackLink } from '@tanstack/react-router'
import { ArrowTopRightIcon } from '../icons/ArrowTopRightIcon'

/**
 * InlineLink component is a link that is displayed inline with text.
 * Tanstack Link manages both internal and external links
 */
export const InlineLink = ({
  to,
  external = false,
  hideIcon = false,
  children,
}: {
  to?: string
  external?: boolean
  hideIcon?: boolean
  children: ReactNode
}) => {
  const isExternal = external || to?.startsWith('http')
  return (
    <Link
      sx={{ color: 'currentColor', '&:hover': { textDecoration: 'none' } }}
      component={TanstackLink}
      to={to}
      {...(isExternal && { target: '_blank', rel: 'noreferrer noopener' })}
    >
      {children}
      {isExternal && !hideIcon && <ArrowTopRightIcon fontSize="small" sx={{ verticalAlign: 'bottom' }} />}
    </Link>
  )
}
