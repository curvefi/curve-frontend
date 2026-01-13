import { useMemo } from 'react'
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
  ChevronRight,
  ChevronUp,
  CheckmarkFilled,
  Close,
  Copy,
  CurrencyDollar,
  Hourglass,
  FavoriteFilled,
  FavoriteHalf,
  InformationSquare,
  InformationSquareFilled,
  Locked,
  Maximize,
  Minimize,
  Misuse,
  Launch,
  Search,
  Settings,
  Renew,
  RowDelete,
  SidePanelClose,
  SidePanelOpen,
  Stop,
  StopFilledAlt,
  Wallet,
  WarningSquareFilled,
  StoragePool,
  OverflowMenuVertical,
} from '@carbon/icons-react'

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
  ChevronRight,
  ChevronUp,
  CheckmarkFilled,
  Close,
  Copy,
  CurrencyDollar,
  Hourglass,
  FavoriteFilled,
  FavoriteHalf,
  InformationSquare,
  InformationSquareFilled,
  Locked,
  Maximize,
  Minimize,
  Misuse,
  Launch,
  Search,
  Settings,
  Renew,
  RowDelete,
  SidePanelClose,
  SidePanelOpen,
  Stop,
  StopFilledAlt,
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

export const Icon = ({ className, name, size, ...props }: IconProps) => {
  const IconSvg = useMemo(() => {
    if (name && name in icon) {
      return icon[name]
    }
  }, [name])

  return IconSvg ? <IconSvg className={className} size={size} {...props} /> : <></>
}
