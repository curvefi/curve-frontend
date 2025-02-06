/**
 * Override the types of the `Select` and `ListBox` components to add the `children` prop.
 * This is for backwards compatibility with the existing components that are currently passing the children prop.
 *
 * --- Some background
 * They changed they API like e.g.: `AriaSelectOptions<T> = Omit<AriaSelectProps<T>, 'children'>`
 * Their source code, however, always passes all given props back to the caller (at this moment).
 * The components seem to work fine, but the types are broken.
 *
 * TODO Refactor components to render their own children, or replace with MUI
 */
declare module '@react-types/select' {
  import {
    AriaListBoxOptions as OriginalListBoxOptions,
    AriaSelectOptions as OriginalSelectOptions,
    SelectProps as OriginalSelectProps,
    SelectStateOptions as OriginalSelectStateOptions,
  } from '@react-types/select'

  type FieldsToAdd = Pick<OriginalSelectProps, 'children'>
  export interface SelectStateOptions<T> extends OriginalSelectStateOptions<T>, FieldsToAdd {}
  export interface AriaSelectOptions<T> extends OriginalSelectOptions<T>, FieldsToAdd {}
  export interface AriaListBoxOptions<T> extends OriginalListBoxOptions<T>, FieldsToAdd {}
}
