/**
 * Preset options for borrowing
 * @see BORROW_PRESET_RANGES
 **/
export enum BorrowPreset {
  Safe = 'Safe',
  MaxLtv = 'MaxLtv',
  Custom = 'Custom',
}

export const BORROW_PRESET_RANGES = {
  [BorrowPreset.Safe]: 50,
  [BorrowPreset.MaxLtv]: 4,
  [BorrowPreset.Custom]: 10,
}
