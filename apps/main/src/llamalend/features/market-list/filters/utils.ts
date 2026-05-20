import { splitAt } from '@primitives/array.utils'
import { notFalsyArray } from '@primitives/objects.utils'

const MAX_VISIBLE_INLINED_ITEMS = 4

/**
 * Split an array between visible and hidden items to maintain inline compaction.
 * Any remaining items are collapsed into a single "+N" item, if more than 1 item is hidden
 */
export const getInlinedItemsVisibility = (
  selectedItems: string[] | undefined,
  maxVisibleInlinedItems: number = MAX_VISIBLE_INLINED_ITEMS,
) => {
  selectedItems = notFalsyArray(selectedItems)
  return splitAt(
    selectedItems,
    selectedItems.length === maxVisibleInlinedItems ? maxVisibleInlinedItems : maxVisibleInlinedItems - 1,
  )
}
