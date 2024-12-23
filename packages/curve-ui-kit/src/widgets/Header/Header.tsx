import { HeaderProps } from './types'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import type { Theme } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'

const isDesktop = (theme: Theme) => theme.breakpoints.up('desktop')

export const Header = <TChainId extends number>({ isMdUp, ...props }: HeaderProps<TChainId>) =>
  useMediaQuery(isDesktop, { noSsr: true }) ? <DesktopHeader {...props} /> : <MobileHeader {...props} />
