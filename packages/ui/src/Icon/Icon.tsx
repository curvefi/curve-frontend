import type { CarbonIconProps } from '@carbon/icons-react'

import {
  ArrowUp,
  ArrowDown,
  ArrowsHorizontal,
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
  InformationSquare,
  InformationSquareFilled,
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
  WarningSquareFilled,
  StoragePool,
} from '@carbon/icons-react'
import { useMemo } from 'react'

const icon = {
  ArrowUp,
  ArrowDown,
  ArrowsHorizontal,
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
  InformationSquare,
  InformationSquareFilled,
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
  WarningSquareFilled,
  StoragePool,
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

Icon.defaultProps = {
  className: '',
}

export default Icon
