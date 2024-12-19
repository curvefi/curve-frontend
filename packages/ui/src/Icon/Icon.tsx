import type { CarbonIconProps } from '@carbon/icons-react'

import {
  ArrowUp,
  ArrowUpRight,
  ArrowDown,
  ArrowsHorizontal,
  ArrowLeft,
  ArrowRight,
  ArrowsVertical,
  Calendar,
  Cursor_1,
  CaretDown,
  CaretUp,
  ChevronDown,
  ChevronLeft,
  ChevronSort,
  ChevronRight,
  ChevronUp,
  CheckmarkFilled,
  Close,
  Copy,
  CurrencyDollar,
  Hourglass,
  Favorite,
  FavoriteFilled,
  FavoriteHalf,
  Fire,
  InformationSquare,
  InformationSquareFilled,
  Locked,
  Maximize,
  Menu,
  Minimize,
  Misuse,
  Launch,
  Search,
  Settings,
  SettingsAdjust,
  Renew,
  RowDelete,
  SidePanelClose,
  SidePanelOpen,
  Stop,
  StopFilledAlt,
  UpToTop,
  Wallet,
  WarningSquareFilled,
  StoragePool,
  OverflowMenuVertical,
} from '@carbon/icons-react'
import { useMemo } from 'react'

const icon = {
  ArrowUp,
  ArrowUpRight,
  ArrowDown,
  ArrowsHorizontal,
  ArrowLeft,
  ArrowRight,
  ArrowsVertical,
  Calendar,
  Cursor_1,
  CaretDown,
  CaretUp,
  ChevronDown,
  ChevronLeft,
  ChevronSort,
  ChevronRight,
  ChevronUp,
  CheckmarkFilled,
  Close,
  Copy,
  CurrencyDollar,
  Hourglass,
  Favorite,
  FavoriteFilled,
  FavoriteHalf,
  Fire,
  InformationSquare,
  InformationSquareFilled,
  Locked,
  Maximize,
  Menu,
  Minimize,
  Misuse,
  Launch,
  Search,
  Settings,
  SettingsAdjust,
  Renew,
  RowDelete,
  SidePanelClose,
  SidePanelOpen,
  Stop,
  StopFilledAlt,
  UpToTop,
  Wallet,
  WarningSquareFilled,
  StoragePool,
  OverflowMenuVertical,
} as const

export interface IconProps extends CarbonIconProps {
  className?: string
  name: keyof typeof icon
  size: 16 | 20 | 24 | 32
}

const Icon = ({ className, name, size, ...props }: IconProps) => {
  const IconSvg = useMemo(() => {
    if (name && name in icon) {
      return icon[name]
    }
  }, [name])

  return IconSvg ? <IconSvg className={className} size={size} {...props} /> : <></>
}

export default Icon
