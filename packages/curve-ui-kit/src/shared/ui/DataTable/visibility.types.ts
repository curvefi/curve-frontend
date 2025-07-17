export type VisibilityOption<ColumnIds> = {
  columns: ColumnIds[] // the column ids that are affected by this option
  active: boolean // whether the column is currently visible in the table
  label: string // the label for the popover, without a label the option is not shown
  enabled: boolean // whether the column can be currently used
}

export type VisibilityGroup<ColumnIds> = {
  options: VisibilityOption<ColumnIds>[]
  label: string
}

export type VisibilityVariants<Variant extends string, ColumnIds> = Record<Variant, VisibilityGroup<ColumnIds>[]>
