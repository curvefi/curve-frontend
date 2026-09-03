import type { BaseConfig } from '@legacy-ui/utils'
import { BorrowersCard, SuppliersCard } from './MarketParticipantsCards'

export const MarketParticipants = ({
  chainId,
  networkConfig,
}: {
  chainId: number
  networkConfig: BaseConfig | undefined
}) => (
  <>
    <BorrowersCard networkConfig={networkConfig} />
    <SuppliersCard chainId={chainId} networkConfig={networkConfig} />
  </>
)
