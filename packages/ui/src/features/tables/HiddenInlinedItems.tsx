import type { ReactNode } from 'react'

/** Renders the overflow indicator for items hidden behind a max visibility limit. */
export const HiddenInlinedItems = ({
  hiddenSelectedItemsLength,
  renderItem,
}: {
  hiddenSelectedItemsLength: number
  renderItem?: (value: string) => ReactNode
}) => {
  const label = `+${hiddenSelectedItemsLength}`
  return !!hiddenSelectedItemsLength && (renderItem?.(label) ?? label)
}
