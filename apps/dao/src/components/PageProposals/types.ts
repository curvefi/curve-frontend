export type FilterKey = 'all' | 'active' | 'passed' | 'denied'

export type ProposalListFilter = {
  key: FilterKey
  label: string
}
