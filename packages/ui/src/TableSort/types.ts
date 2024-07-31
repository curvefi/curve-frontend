import React from 'react'

export interface TableSortSelectProps<T> {
  searchParams: T
  labelsMapper: LabelsMapper
  onSelectionDelete?(): void
  updatePath(updatedFormValues: Partial<T>): void
}

export type LabelsMapper = {
  [label: string]: {
    name: string | React.ReactNode
    mobile?: string
  }
}
