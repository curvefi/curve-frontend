import { LendingVaultFromApi } from '@/entities/vaults'
import { formatNumber } from '@/ui/utils'

export const LiquidityCell = ({ data }: { data: LendingVaultFromApi }) => formatNumber(data.totalSupplied.usdTotal, { currency: 'USD', notation: 'compact' })
