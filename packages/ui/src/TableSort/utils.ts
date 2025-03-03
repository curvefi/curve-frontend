import { ReactNode } from 'react'

export function getLabel(
  labelsMapper: { [p: string]: { name: ReactNode; mobile?: string } },
  sortBy: string,
) {
  return labelsMapper[sortBy]?.mobile ?? labelsMapper[sortBy]?.name ?? ''
}
