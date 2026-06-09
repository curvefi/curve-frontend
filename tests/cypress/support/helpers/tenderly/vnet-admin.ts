import { LOAD_TIMEOUT } from '@cy/support/ui'
import { getRpcUrls } from './vnet'
import type { CreateVirtualTestnetResponse } from './vnet-create'

/**
 * Move the Tenderly vnet clock forward and mine one block so elapsed-time based
 * state changes are reflected in subsequent reads.
 */
export const advanceVirtualNetworkClock = ({
  vnet,
  seconds,
}: {
  vnet: CreateVirtualTestnetResponse
  seconds: number
}) => {
  const { adminRpcUrl } = getRpcUrls(vnet)

  return (
    cy
      .request({
        method: 'POST',
        url: adminRpcUrl,
        body: { jsonrpc: '2.0', method: 'evm_increaseTime', params: [seconds], id: 1 },
        ...LOAD_TIMEOUT,
      })
      .then(response => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        expect(response.isOkStatusCode).to.equal(true, response.body.error)
        return cy.request({
          method: 'POST',
          url: adminRpcUrl,
          body: { jsonrpc: '2.0', method: 'evm_mine', params: [], id: 2 },
          ...LOAD_TIMEOUT,
        })
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
      .then(response => expect(response.isOkStatusCode).to.equal(true, response.body.error))
  )
}
