export enum ProposalColumnId {
  TimeCreated = 'timeCreated',
  EndingSoon = 'endingSoon',
  Status = 'status',
}

export type ProposalSortBy = ProposalColumnId.TimeCreated | ProposalColumnId.EndingSoon
export type ProposalSortDirection = 'asc' | 'desc'
export type ProposalStatusFilter = 'all' | 'active' | 'passed' | 'executable' | 'denied'
