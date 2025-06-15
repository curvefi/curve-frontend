export const layoutHeightKeys = ['globalAlert', 'mainNav', 'secondaryNav', 'footer'] as const
type LayoutHeightKey = (typeof layoutHeightKeys)[number]
export type LayoutHeight = Record<LayoutHeightKey, number>

export type PageWidthClassName =
  | 'page-wide'
  | 'page-large'
  | 'page-medium'
  | 'page-small'
  | 'page-small-x'
  | 'page-small-xx'
