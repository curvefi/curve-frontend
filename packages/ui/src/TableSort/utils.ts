export function getLabel(
  labelsMapper: { [p: string]: { name: string | React.ReactNode; mobile?: string } },
  sortBy: string
) {
  return labelsMapper[sortBy]?.mobile ?? labelsMapper[sortBy]?.name ?? ''
}
