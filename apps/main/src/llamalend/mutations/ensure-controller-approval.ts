import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { fetchIsControllerApproved } from '@/llamalend/queries/controller-approval.query'
import { waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'

export const ensureControllerApproval = async ({
  market,
  chainId,
  userAddress,
  config,
}: {
  market: MarketTemplate
  chainId: number
  userAddress: Address
  config: Parameters<typeof waitForApproval>[0]['config']
}) => {
  await waitForApproval({
    isApproved: () => fetchIsControllerApproved({ chainId, marketId: market.id, userAddress }, { staleTime: 0 }),
    onApprove: async () => (await market.leverageZapV2.setControllerApproval()) as Hex[],
    message: t`Approved leverage delegation`,
    config,
  })
}
